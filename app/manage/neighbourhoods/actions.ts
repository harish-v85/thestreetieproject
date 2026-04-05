"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { redirectWithFlash } from "@/lib/redirect-with-flash";
import { createClient } from "@/lib/supabase/server";
import { requirePrivileged } from "@/lib/auth/require-privileged";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { slugify } from "@/lib/dogs/slugify";

export type NeighbourhoodFormState = { error: string | null };

async function uniqueNeighbourhoodSlug(
  supabase: Awaited<ReturnType<typeof createClient>>,
  localityId: string,
  base: string,
  excludeId?: string,
) {
  let slug = base;
  let counter = 2;
  for (let i = 0; i < 50; i++) {
    const { data } = await supabase
      .from("neighbourhoods")
      .select("id")
      .eq("locality_id", localityId)
      .eq("slug", slug)
      .maybeSingle();
    if (!data || data.id === excludeId) return slug;
    slug = `${base}-${counter}`;
    counter += 1;
  }
  return `${base}-${Date.now()}`;
}

export async function approveNeighbourhoodAction(formData: FormData): Promise<void> {
  await requireSuperAdmin("/manage/neighbourhoods");
  const supabase = await createClient();
  const raw = formData.get("neighbourhood_id");
  const neighbourhoodId = typeof raw === "string" ? raw.trim() : "";
  if (!neighbourhoodId) redirect("/manage/neighbourhoods");

  const { error } = await supabase
    .from("neighbourhoods")
    .update({ approval_status: "approved" })
    .eq("id", neighbourhoodId);

  if (error) {
    console.error("approveNeighbourhoodAction", error.message);
    redirect("/manage/neighbourhoods");
  }

  revalidateNeighbourhoodConsumers();
  redirectWithFlash("/manage/neighbourhoods", "neighbourhood_approved");
}

function revalidateNeighbourhoodConsumers() {
  revalidatePath("/");
  revalidatePath("/dogs");
  revalidatePath("/manage/dogs");
  revalidatePath("/manage/dogs/new");
  revalidatePath("/manage/localities");
  revalidatePath("/manage/neighbourhoods");
  revalidatePath("/manage/users");
  revalidatePath("/manage/users/new");
}

export async function createNeighbourhood(
  _prev: NeighbourhoodFormState,
  formData: FormData,
): Promise<NeighbourhoodFormState> {
  const { role } = await requirePrivileged("/manage/neighbourhoods");
  const supabase = await createClient();
  const approval_status = role === "super_admin" ? "approved" : "pending";

  const locality_id = String(formData.get("locality_id") ?? "").trim();
  if (!locality_id) return { error: "Choose a locality." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name is required." };

  const slugInput = String(formData.get("slug") ?? "").trim();
  const base = slugify(slugInput || name);
  const slug = await uniqueNeighbourhoodSlug(supabase, locality_id, base);

  const sortRaw = String(formData.get("sort_order") ?? "").trim();
  const sort_order = sortRaw === "" ? 0 : Number(sortRaw);
  if (!Number.isFinite(sort_order)) return { error: "Sort order must be a number." };

  const { error } = await supabase.from("neighbourhoods").insert({
    locality_id,
    name,
    slug,
    sort_order,
    approval_status,
  });

  if (error) return { error: error.message };

  revalidateNeighbourhoodConsumers();
  redirectWithFlash("/manage/neighbourhoods", "neighbourhood_created");
}

export async function updateNeighbourhood(
  neighbourhoodId: string,
  localityId: string,
  currentSlug: string,
  _prev: NeighbourhoodFormState,
  formData: FormData,
): Promise<NeighbourhoodFormState> {
  await requirePrivileged("/manage/neighbourhoods");
  const supabase = await createClient();

  const locality_id = String(formData.get("locality_id") ?? "").trim();
  if (!locality_id) return { error: "Choose a locality." };

  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Name is required." };

  let slug = slugify(String(formData.get("slug") ?? "").trim() || name);
  if (locality_id !== localityId || slug !== currentSlug) {
    slug = await uniqueNeighbourhoodSlug(supabase, locality_id, slug, neighbourhoodId);
  } else {
    slug = currentSlug;
  }

  const sortRaw = String(formData.get("sort_order") ?? "").trim();
  const sort_order = sortRaw === "" ? 0 : Number(sortRaw);
  if (!Number.isFinite(sort_order)) return { error: "Sort order must be a number." };

  const { error } = await supabase
    .from("neighbourhoods")
    .update({
      locality_id,
      name,
      slug,
      sort_order,
    })
    .eq("id", neighbourhoodId);

  if (error) return { error: error.message };

  revalidateNeighbourhoodConsumers();
  redirectWithFlash("/manage/neighbourhoods", "neighbourhood_updated");
}

export async function deleteNeighbourhood(neighbourhoodId: string): Promise<NeighbourhoodFormState> {
  await requirePrivileged("/manage/neighbourhoods");
  const supabase = await createClient();

  const { error } = await supabase.from("neighbourhoods").delete().eq("id", neighbourhoodId);

  if (error) {
    if (
      error.message.toLowerCase().includes("foreign key") ||
      error.code === "23503" ||
      error.message.includes("violates foreign key")
    ) {
      return {
        error:
          "Cannot delete while dogs use this neighbourhood. Reassign those dogs to another neighbourhood first.",
      };
    }
    return { error: error.message };
  }

  revalidateNeighbourhoodConsumers();
  redirectWithFlash("/manage/neighbourhoods", "neighbourhood_deleted");
}
