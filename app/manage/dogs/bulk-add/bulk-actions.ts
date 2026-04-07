"use server";

import ExcelJS from "exceljs";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import {
  parseBulkCsv,
  parseBulkWorkbook,
  previewBulkRows,
  resolveNeighbourhoodId,
  type BulkDogPreviewRow,
  type BulkDogRow,
  type LocalityRow,
  type NeighbourhoodRow,
} from "@/lib/dogs/bulk-dog-import";
import { resolveAgeEstimatedOnForSave } from "@/lib/dogs/dog-age";
import { resolveCollarDescriptionForSave } from "@/lib/dogs/collar";
import { normalizeNameAliasesJson } from "@/lib/dogs/name-aliases";
import { slugify } from "@/lib/dogs/slugify";

function missingWelfareRemarksColumn(err: { message?: string }): boolean {
  return (err.message ?? "").toLowerCase().includes("welfare_remarks");
}

function missingNameAliasesColumn(err: { message?: string }): boolean {
  return (err.message ?? "").toLowerCase().includes("name_aliases");
}

async function uniqueSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  base: string,
) {
  let slug = base;
  let counter = 2;
  for (let i = 0; i < 50; i++) {
    const { data } = await supabase.from("dogs").select("id").eq("slug", slug).maybeSingle();
    if (!data) return slug;
    slug = `${base}-${counter}`;
    counter += 1;
  }
  return `${base}-${Date.now()}`;
}

async function loadLocationMaps(supabase: Awaited<ReturnType<typeof createClient>>): Promise<{
  localities: LocalityRow[];
  neighbourhoods: NeighbourhoodRow[];
}> {
  const [{ data: locs }, { data: nbs }] = await Promise.all([
    supabase
      .from("localities")
      .select("id, name")
      .eq("approval_status", "approved")
      .order("sort_order", { ascending: true }),
    supabase
      .from("neighbourhoods")
      .select("id, locality_id, name")
      .eq("approval_status", "approved")
      .order("sort_order", { ascending: true }),
  ]);
  return {
    localities: (locs ?? []).map((l) => ({ id: l.id, name: l.name })),
    neighbourhoods: (nbs ?? []).map((n) => ({
      id: n.id,
      locality_id: n.locality_id,
      name: n.name,
    })),
  };
}

export type PreviewResult =
  | {
      ok: true;
      rows: BulkDogPreviewRow[];
      parseErrors: string[];
    }
  | { ok: false; error: string };

export async function previewBulkDogImport(formData: FormData): Promise<PreviewResult> {
  await requireSuperAdmin("/manage/dogs/bulk-add");

  const file = formData.get("file");
  if (!file || !(file instanceof File)) {
    return { ok: false, error: "Choose a file to upload." };
  }

  const arrayBuffer = await file.arrayBuffer();
  const name = file.name.toLowerCase();

  let rows: BulkDogRow[] = [];
  const parseLineErrors: string[] = [];

  if (name.endsWith(".csv")) {
    const text = Buffer.from(arrayBuffer).toString("utf8");
    const parsed = parseBulkCsv(text);
    rows = parsed.rows;
    parseLineErrors.push(...parsed.errors.map((e) => e.line));
  } else if (name.endsWith(".xlsx") || name.endsWith(".xlsm")) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(arrayBuffer);
    const parsed = await parseBulkWorkbook(workbook);
    rows = parsed.rows;
    parseLineErrors.push(...parsed.errors.map((e) => e.line));
  } else {
    return {
      ok: false,
      error: "Unsupported file type. Upload a .xlsx or .csv file.",
    };
  }

  const supabase = await createClient();
  const { localities, neighbourhoods } = await loadLocationMaps(supabase);
  const preview = previewBulkRows(rows, localities, neighbourhoods);

  return {
    ok: true,
    rows: preview,
    parseErrors: parseLineErrors,
  };
}

export type CommitResult =
  | {
      ok: true;
      added: number;
      skipped: { sno: string; reason: string }[];
    }
  | { ok: false; error: string };

export async function commitBulkDogImport(rowsJson: string): Promise<CommitResult> {
  const { userId } = await requireSuperAdmin("/manage/dogs/bulk-add");

  let rows: BulkDogRow[];
  try {
    rows = JSON.parse(rowsJson) as BulkDogRow[];
    if (!Array.isArray(rows)) throw new Error("Invalid payload");
  } catch {
    return { ok: false, error: "Invalid data. Go back and upload the file again." };
  }

  const supabase = await createClient();
  const { localities, neighbourhoods } = await loadLocationMaps(supabase);

  const skipped: { sno: string; reason: string }[] = [];
  let added = 0;

  const currentYear = new Date().getFullYear();

  for (const row of rows) {
    const nb = resolveNeighbourhoodId(row.locality, row.neighbourhood, localities, neighbourhoods);
    if (!nb) {
      skipped.push({
        sno: row.sno,
        reason: "Locality and neighbourhood could not be matched.",
      });
      continue;
    }

    if (row.estimated_birth_year != null) {
      if (row.estimated_birth_year < 1980 || row.estimated_birth_year > currentYear) {
        skipped.push({
          sno: row.sno,
          reason: "Estimated birth year out of allowed range.",
        });
        continue;
      }
    }

    const estimated_birth_year = row.estimated_birth_year;
    const age_estimated_on = resolveAgeEstimatedOnForSave(
      estimated_birth_year,
      row.age_estimated_on,
    );

    const name = row.name.trim();
    if (!name) {
      skipped.push({ sno: row.sno, reason: "Name is empty." });
      continue;
    }

    const base = slugify(name);
    const slug = await uniqueSlug(supabase, base);

    const name_aliases = normalizeNameAliasesJson(JSON.stringify(row.aliases));

    const has_collar = "unsure" as const;
    const collar_description = resolveCollarDescriptionForSave(has_collar, null);

    const insertBase = {
      slug,
      name,
      name_aliases,
      description: null as string | null,
      gender: row.gender,
      coat_pattern: "unsure" as const,
      colour_primary: "unsure" as const,
      colour_secondary: null as string | null,
      colour_tertiary: null as string | null,
      neutering_status: row.neutering_status,
      neighbourhood_id: nb.id,
      street_name: row.street,
      landmark: null as string | null,
      map_lat: row.map_lat,
      map_lng: row.map_lng,
      welfare_status: "healthy" as const,
      status: "active" as const,
      featured: false,
      created_by: userId,
      estimated_birth_year,
      age_estimated_on,
      age_confidence: row.age_confidence,
      has_collar,
      collar_description,
    };

    const welfare_remarks = null;

    let { data: dog, error } = await supabase
      .from("dogs")
      .insert({ ...insertBase, welfare_remarks })
      .select("id, slug")
      .single();

    if (error && missingWelfareRemarksColumn(error)) {
      ({ data: dog, error } = await supabase
        .from("dogs")
        .insert(insertBase)
        .select("id, slug")
        .single());
    }

    if (error && missingNameAliasesColumn(error)) {
      const { name_aliases, ...withoutAliases } = insertBase;
      void name_aliases;
      ({ data: dog, error } = await supabase
        .from("dogs")
        .insert({ ...withoutAliases, welfare_remarks })
        .select("id, slug")
        .single());
    }
    if (error && missingNameAliasesColumn(error)) {
      const { name_aliases, ...withoutAliases } = insertBase;
      void name_aliases;
      ({ data: dog, error } = await supabase
        .from("dogs")
        .insert(withoutAliases)
        .select("id, slug")
        .single());
    }

    if (error || !dog) {
      skipped.push({
        sno: row.sno,
        reason: error?.message ?? "Database error.",
      });
      continue;
    }

    const { error: hangoutErr } = await supabase.rpc("sync_dog_hangout_clique", {
      p_dog_id: dog.id,
      p_companion_ids: [],
    });

    if (hangoutErr) {
      await supabase.from("dogs").delete().eq("id", dog.id);
      skipped.push({ sno: row.sno, reason: hangoutErr.message });
      continue;
    }

    added += 1;
  }

  revalidatePath("/");
  revalidatePath("/dogs");
  revalidatePath("/manage/dogs");

  return { ok: true, added, skipped };
}
