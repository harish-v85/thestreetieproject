"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { redirectWithFlash } from "@/lib/redirect-with-flash";
import { createClient } from "@/lib/supabase/server";
import { requirePrivileged } from "@/lib/auth/require-privileged";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { slugify } from "@/lib/dogs/slugify";

export type LocalityFormState = { error: string | null };

function optFloat(formData: FormData, key: string): number | null {
  const v = formData.get(key);
  if (v == null || String(v).trim() === "") return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

async function uniqueLocalitySlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  base: string,
  excludeId?: string,
) {
  let slug = base;
  let counter = 2;
  for (let i = 0; i < 50; i++) {
    const { data } = await supabase.from("localities").select("id").eq("slug", slug).maybeSingle();
    if (!data || data.id === excludeId) return slug;
    slug = `${base}-${counter}`;
    counter += 1;
  }
  return `${base}-${Date.now()}`;
}

function revalidateLocalityConsumers() {
  revalidatePath("/");
  revalidatePath("/dogs");
  revalidatePath("/manage/dogs");
  revalidatePath("/manage/dogs/new");
  revalidatePath("/manage/localities");
  revalidatePath("/manage/neighbourhoods");
  revalidatePath("/manage/neighbourhoods/new");
  revalidatePath("/manage/users");
  revalidatePath("/manage/users/new");
}

export async function approveLocalityAction(formData: FormData): Promise<void> {
  await requireSuperAdmin("/manage/localities");
  const supabase = await createClient();
  const raw = formData.get("locality_id");
  const localityId = typeof raw === "string" ? raw.trim() : "";
  if (!localityId) redirect("/manage/localities");

  const { error } = await supabase
    .from("localities")
    .update({ approval_status: "approved" })
    .eq("id", localityId);

  if (error) {
    console.error("approveLocalityAction", error.message);
    redirect("/manage/localities");
  }

  await supabase
    .from("neighbourhoods")
    .update({ approval_status: "approved" })
    .eq("locality_id", localityId)
    .eq("slug", "unspecified");

  revalidateLocalityConsumers();
  redirectWithFlash("/manage/localities", "locality_approved");
}

export async function createLocality(
  _prev: LocalityFormState,
  formData: FormData,
): Promise<LocalityFormState> {
  const { role } = await requirePrivileged("/manage/localities");
  const supabase = await createClient();
  const approval_status = role === "super_admin" ? "approved" : "pending";

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name is required." };

  const slugInput = String(formData.get("slug") ?? "").trim();
  const base = slugify(slugInput || name);
  const slug = await uniqueLocalitySlug(supabase, base);

  const sortRaw = String(formData.get("sort_order") ?? "").trim();
  const sort_order = sortRaw === "" ? 0 : Number(sortRaw);
  if (!Number.isFinite(sort_order)) return { error: "Sort order must be a number." };

  const center_lat = optFloat(formData, "center_lat");
  const center_lng = optFloat(formData, "center_lng");

  const { data: created, error } = await supabase
    .from("localities")
    .insert({
      name,
      slug,
      sort_order,
      center_lat,
      center_lng,
      approval_status,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  const { error: nbErr } = await supabase.from("neighbourhoods").insert({
    locality_id: created.id,
    name: "Unspecified",
    slug: "unspecified",
    sort_order: 0,
    approval_status,
  });

  if (nbErr) return { error: `Locality created but default neighbourhood failed: ${nbErr.message}` };

  revalidateLocalityConsumers();
  redirectWithFlash("/manage/localities", "locality_created");
}

export async function updateLocality(
  localityId: string,
  currentSlug: string,
  _prev: LocalityFormState,
  formData: FormData,
): Promise<LocalityFormState> {
  await requirePrivileged("/manage/localities");
  const supabase = await createClient();

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name is required." };

  let slug = slugify(String(formData.get("slug") ?? "").trim() || name);
  if (slug !== currentSlug) {
    slug = await uniqueLocalitySlug(supabase, slug, localityId);
  } else {
    slug = currentSlug;
  }

  const sortRaw = String(formData.get("sort_order") ?? "").trim();
  const sort_order = sortRaw === "" ? 0 : Number(sortRaw);
  if (!Number.isFinite(sort_order)) return { error: "Sort order must be a number." };

  const center_lat = optFloat(formData, "center_lat");
  const center_lng = optFloat(formData, "center_lng");

  const { error } = await supabase
    .from("localities")
    .update({
      name,
      slug,
      sort_order,
      center_lat,
      center_lng,
    })
    .eq("id", localityId);

  if (error) return { error: error.message };

  revalidateLocalityConsumers();
  redirectWithFlash("/manage/localities", "locality_updated");
}

export async function deleteLocality(localityId: string): Promise<LocalityFormState> {
  await requirePrivileged("/manage/localities");
  const supabase = await createClient();

  const { error } = await supabase.from("localities").delete().eq("id", localityId);

  if (error) {
    if (
      error.message.toLowerCase().includes("foreign key") ||
      error.code === "23503" ||
      error.message.includes("violates foreign key")
    ) {
      return {
        error:
          "Cannot delete while neighbourhoods, dogs, or profiles still reference this locality. Remove or reassign them first.",
      };
    }
    return { error: error.message };
  }

  revalidateLocalityConsumers();
  redirectWithFlash("/manage/localities", "locality_deleted");
}
