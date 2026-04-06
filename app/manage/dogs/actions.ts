"use server";

import { revalidatePath } from "next/cache";
import { redirectWithFlash } from "@/lib/redirect-with-flash";
import { createClient } from "@/lib/supabase/server";
import { requirePrivileged } from "@/lib/auth/require-privileged";
import { parseCoatFromFormData } from "@/lib/dogs/coat";
import { normalizeNameAliasesJson } from "@/lib/dogs/name-aliases";
import { slugify } from "@/lib/dogs/slugify";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** PostgREST/Postgres error when `welfare_remarks` column is not migrated yet. */
function missingWelfareRemarksColumn(err: { message?: string }): boolean {
  return (err.message ?? "").toLowerCase().includes("welfare_remarks");
}

function missingNameAliasesColumn(err: { message?: string }): boolean {
  return (err.message ?? "").toLowerCase().includes("name_aliases");
}

function parseHangoutCompanionIds(formData: FormData, dogId: string): string[] {
  const raw = formData.getAll("hangout_companion_id");
  const out: string[] = [];
  const seen = new Set<string>();
  for (const v of raw) {
    const id = String(v).trim();
    if (!UUID_RE.test(id) || id === dogId || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
  }
  return out;
}

function companionIdsFromPairRows(
  rows: { dog_a: string; dog_b: string }[],
  dogId: string,
): Set<string> {
  const s = new Set<string>();
  for (const r of rows) {
    if (r.dog_a === dogId) s.add(r.dog_b);
    else if (r.dog_b === dogId) s.add(r.dog_a);
  }
  return s;
}

function optFloat(formData: FormData, key: string): number | null {
  const v = formData.get(key);
  if (v == null || String(v).trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

async function uniqueSlug(supabase: Awaited<ReturnType<typeof createClient>>, base: string) {
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

export type DogFormState = { error: string | null };

export async function createDog(
  _prev: DogFormState,
  formData: FormData,
): Promise<DogFormState> {
  const { userId } = await requirePrivileged();
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name is required." };

  const slugInput = String(formData.get("slug") ?? "").trim();
  const base = slugify(slugInput || name);
  const slug = await uniqueSlug(supabase, base);

  const neighbourhood_id = String(formData.get("neighbourhood_id") ?? "").trim();
  if (!neighbourhood_id) return { error: "Choose a neighbourhood." };

  const street_name = String(formData.get("street_name") ?? "").trim() || null;
  const landmark = String(formData.get("landmark") ?? "").trim() || null;

  const gender = String(formData.get("gender") ?? "unknown");
  const neutering_status = String(formData.get("neutering_status") ?? "unknown");
  const welfare_status = String(formData.get("welfare_status") ?? "healthy");

  if (!["male", "female", "unknown"].includes(gender)) return { error: "Invalid gender." };
  if (!["neutered", "not_neutered", "unknown"].includes(neutering_status)) {
    return { error: "Invalid neutering status." };
  }
  if (
    !["healthy", "needs_attention", "injured", "missing", "deceased"].includes(welfare_status)
  ) {
    return { error: "Invalid welfare status." };
  }

  const description = String(formData.get("description") ?? "").trim() || null;
  const welfare_remarks = String(formData.get("welfare_remarks") ?? "").trim() || null;
  const coatParsed = parseCoatFromFormData(formData);
  if ("error" in coatParsed) return { error: coatParsed.error };
  const map_lat = optFloat(formData, "map_lat");
  const map_lng = optFloat(formData, "map_lng");
  const primary_photo_url = String(formData.get("primary_photo_url") ?? "").trim();
  const wantFeatured = formData.get("featured") === "on";

  const name_aliases = normalizeNameAliasesJson(String(formData.get("name_aliases_json") ?? ""));

  const insertBase = {
    slug,
    name,
    name_aliases,
    description,
    gender,
    coat_pattern: coatParsed.coat_pattern,
    colour_primary: coatParsed.colour_primary,
    colour_secondary: coatParsed.colour_secondary,
    colour_tertiary: coatParsed.colour_tertiary,
    neutering_status,
    neighbourhood_id,
    street_name,
    landmark,
    map_lat,
    map_lng,
    welfare_status,
    status: "active" as const,
    featured: wantFeatured,
    created_by: userId,
  };

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

  if (error) return { error: error.message };
  if (!dog) return { error: "Could not create dog." };

  if (wantFeatured) {
    await supabase.from("dogs").update({ featured: false }).neq("id", dog.id);
  }

  if (primary_photo_url) {
    await supabase.from("dog_photos").insert({
      dog_id: dog.id,
      url: primary_photo_url,
      is_primary: false,
      sort_order: 0,
      uploaded_by: userId,
    });
  }

  revalidatePath("/");
  revalidatePath("/dogs");
  revalidatePath("/manage/dogs");
  redirectWithFlash(`/dogs/${dog.slug}`, "dog_created");
}

export async function updateDog(
  dogId: string,
  currentSlug: string,
  _prev: DogFormState,
  formData: FormData,
): Promise<DogFormState> {
  await requirePrivileged();
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name is required." };

  let slug = slugify(String(formData.get("slug") ?? "").trim() || name);
  if (slug !== currentSlug) {
    const { data: taken } = await supabase.from("dogs").select("id").eq("slug", slug).maybeSingle();
    if (taken && taken.id !== dogId) {
      slug = await uniqueSlug(supabase, slug);
    }
  } else {
    slug = currentSlug;
  }

  const neighbourhood_id = String(formData.get("neighbourhood_id") ?? "").trim();
  if (!neighbourhood_id) return { error: "Choose a neighbourhood." };

  const street_name = String(formData.get("street_name") ?? "").trim() || null;
  const landmark = String(formData.get("landmark") ?? "").trim() || null;

  const gender = String(formData.get("gender") ?? "unknown");
  const neutering_status = String(formData.get("neutering_status") ?? "unknown");
  const welfare_status = String(formData.get("welfare_status") ?? "healthy");
  const status = String(formData.get("status") ?? "active");

  if (!["male", "female", "unknown"].includes(gender)) return { error: "Invalid gender." };
  if (!["neutered", "not_neutered", "unknown"].includes(neutering_status)) {
    return { error: "Invalid neutering status." };
  }
  if (
    !["healthy", "needs_attention", "injured", "missing", "deceased"].includes(welfare_status)
  ) {
    return { error: "Invalid welfare status." };
  }
  if (!["active", "archived"].includes(status)) return { error: "Invalid status." };

  const description = String(formData.get("description") ?? "").trim() || null;
  const welfare_remarks = String(formData.get("welfare_remarks") ?? "").trim() || null;
  const coatParsed = parseCoatFromFormData(formData);
  if ("error" in coatParsed) return { error: coatParsed.error };
  const map_lat = optFloat(formData, "map_lat");
  const map_lng = optFloat(formData, "map_lng");
  const wantFeatured = formData.get("featured") === "on";
  const featuredValue = wantFeatured && status === "active";

  if (featuredValue) {
    await supabase.from("dogs").update({ featured: false }).neq("id", dogId);
  }

  const name_aliases = normalizeNameAliasesJson(String(formData.get("name_aliases_json") ?? ""));

  const updateBase = {
    slug,
    name,
    name_aliases,
    description,
    gender,
    coat_pattern: coatParsed.coat_pattern,
    colour_primary: coatParsed.colour_primary,
    colour_secondary: coatParsed.colour_secondary,
    colour_tertiary: coatParsed.colour_tertiary,
    neutering_status,
    neighbourhood_id,
    street_name,
    landmark,
    map_lat,
    map_lng,
    welfare_status,
    status,
    featured: featuredValue,
  };

  let { error } = await supabase
    .from("dogs")
    .update({ ...updateBase, welfare_remarks })
    .eq("id", dogId);

  if (error && missingWelfareRemarksColumn(error)) {
    ({ error } = await supabase.from("dogs").update(updateBase).eq("id", dogId));
  }

  if (error && missingNameAliasesColumn(error)) {
    const { name_aliases, ...withoutAliases } = updateBase;
    void name_aliases;
    ({ error } = await supabase
      .from("dogs")
      .update({ ...withoutAliases, welfare_remarks })
      .eq("id", dogId));
  }
  if (error && missingNameAliasesColumn(error)) {
    const { name_aliases, ...withoutAliases } = updateBase;
    void name_aliases;
    ({ error } = await supabase.from("dogs").update(withoutAliases).eq("id", dogId));
  }

  if (error) return { error: error.message };

  const hangoutCompanionIds = parseHangoutCompanionIds(formData, dogId);

  const { data: pairsBefore } = await supabase
    .from("dog_hangout_pairs")
    .select("dog_a, dog_b")
    .or(`dog_a.eq.${dogId},dog_b.eq.${dogId}`);

  const beforeNeighbors = companionIdsFromPairRows(pairsBefore ?? [], dogId);

  const { error: hangoutErr } = await supabase.rpc("sync_dog_hangout_clique", {
    p_dog_id: dogId,
    p_companion_ids: hangoutCompanionIds,
  });

  if (hangoutErr) return { error: hangoutErr.message };

  const { data: pairsAfter } = await supabase
    .from("dog_hangout_pairs")
    .select("dog_a, dog_b")
    .or(`dog_a.eq.${dogId},dog_b.eq.${dogId}`);

  const afterNeighbors = companionIdsFromPairRows(pairsAfter ?? [], dogId);
  const revalidateIds = new Set<string>([dogId, ...beforeNeighbors, ...afterNeighbors]);

  const { data: slugRows } = await supabase
    .from("dogs")
    .select("slug")
    .in("id", [...revalidateIds]);

  for (const row of slugRows ?? []) {
    revalidatePath(`/dogs/${row.slug}`);
    revalidatePath(`/manage/dogs/${row.slug}/edit`);
  }

  revalidatePath("/");
  revalidatePath("/dogs");
  revalidatePath(`/dogs/${currentSlug}`);
  revalidatePath(`/dogs/${slug}`);
  revalidatePath("/manage/dogs");
  revalidatePath(`/manage/dogs/${currentSlug}/edit`);
  revalidatePath(`/manage/dogs/${slug}/edit`);
  redirectWithFlash(`/dogs/${slug}`, "dog_updated");
}
