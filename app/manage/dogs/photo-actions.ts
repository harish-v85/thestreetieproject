"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { redirectWithFlash } from "@/lib/redirect-with-flash";
import { createClient } from "@/lib/supabase/server";
import { requirePrivileged } from "@/lib/auth/require-privileged";
import {
  deleteCloudinaryImage,
  isCloudinaryConfigured,
  uploadDogImageFromBuffer,
} from "@/lib/cloudinary/dog-images";

const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

function isHttpUrl(s: string): boolean {
  try {
    const u = new URL(s);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export type DogPhotoFormState = { error: string | null };

async function nextSortOrder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  dogId: string,
): Promise<number> {
  const { data: maxRow } = await supabase
    .from("dog_photos")
    .select("sort_order")
    .eq("dog_id", dogId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();
  return (maxRow?.sort_order ?? -1) + 1;
}

async function insertDogPhotoRow(
  supabase: Awaited<ReturnType<typeof createClient>>,
  params: {
    dogId: string;
    userId: string;
    url: string;
    caption: string | null;
    cloudinary_public_id: string | null;
  },
) {
  const sort_order = await nextSortOrder(supabase, params.dogId);
  return supabase.from("dog_photos").insert({
    dog_id: params.dogId,
    url: params.url,
    caption: params.caption,
    cloudinary_public_id: params.cloudinary_public_id,
    is_primary: false,
    sort_order,
    uploaded_by: params.userId,
  });
}

function revalidateDogPhotoPaths(dogSlug: string) {
  revalidatePath("/");
  revalidatePath("/dogs");
  revalidatePath(`/dogs/${dogSlug}`);
  revalidatePath("/manage/dogs");
  revalidatePath(`/manage/dogs/${dogSlug}/edit`);
}

export async function addDogPhoto(
  dogId: string,
  dogSlug: string,
  _prev: DogPhotoFormState,
  formData: FormData,
): Promise<DogPhotoFormState> {
  await requirePrivileged(`/manage/dogs/${dogSlug}/edit`);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { data: dog } = await supabase
    .from("dogs")
    .select("id")
    .eq("id", dogId)
    .maybeSingle();
  if (!dog) return { error: "Dog not found." };

  const url = String(formData.get("url") ?? "").trim();
  if (!url) return { error: "Photo URL is required." };
  if (!isHttpUrl(url)) return { error: "Enter a valid http(s) URL." };

  const caption = String(formData.get("caption") ?? "").trim() || null;

  const { error } = await insertDogPhotoRow(supabase, {
    dogId,
    userId: user.id,
    url,
    caption,
    cloudinary_public_id: null,
  });

  if (error) return { error: error.message };

  revalidateDogPhotoPaths(dogSlug);
  redirectWithFlash(`/manage/dogs/${dogSlug}/edit#photos`, "photo_added");
}

export async function uploadDogPhoto(
  dogId: string,
  dogSlug: string,
  _prev: DogPhotoFormState,
  formData: FormData,
): Promise<DogPhotoFormState> {
  await requirePrivileged(`/manage/dogs/${dogSlug}/edit`);

  if (!isCloudinaryConfigured()) {
    return {
      error:
        "Cloudinary is not configured. Add CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET to the server environment.",
    };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const { data: dog } = await supabase
    .from("dogs")
    .select("id")
    .eq("id", dogId)
    .maybeSingle();
  if (!dog) return { error: "Dog not found." };

  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { error: "Choose an image file to upload." };
  }
  if (file.size > MAX_UPLOAD_BYTES) {
    return { error: "Image must be 5 MB or smaller." };
  }

  const mime = file.type;
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(mime)) {
    return { error: "Use a JPEG, PNG, WebP, or GIF image." };
  }

  let secureUrl: string;
  let publicId: string;
  try {
    const buf = Buffer.from(await file.arrayBuffer());
    const uploaded = await uploadDogImageFromBuffer(buf, mime);
    secureUrl = uploaded.secureUrl;
    publicId = uploaded.publicId;
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Upload failed.";
    return { error: msg };
  }

  const caption = String(formData.get("caption") ?? "").trim() || null;

  const { error } = await insertDogPhotoRow(supabase, {
    dogId,
    userId: user.id,
    url: secureUrl,
    caption,
    cloudinary_public_id: publicId,
  });

  if (error) {
    try {
      await deleteCloudinaryImage(publicId);
    } catch {
      /* best effort */
    }
    return { error: error.message };
  }

  revalidateDogPhotoPaths(dogSlug);
  redirectWithFlash(`/manage/dogs/${dogSlug}/edit#photos`, "photo_added");
}

export async function setPrimaryDogPhotoAction(formData: FormData) {
  await requirePrivileged();
  const dogId = String(formData.get("dog_id") ?? "").trim();
  const dogSlug = String(formData.get("dog_slug") ?? "").trim();
  const photoId = String(formData.get("photo_id") ?? "").trim();
  if (!dogId || !dogSlug || !photoId) {
    redirect("/manage/dogs");
  }

  const supabase = await createClient();

  const { data: row } = await supabase
    .from("dog_photos")
    .select("id, dog_id")
    .eq("id", photoId)
    .maybeSingle();
  if (!row || row.dog_id !== dogId) {
    redirect(`/manage/dogs/${dogSlug}/edit#photos`);
  }

  await supabase.from("dog_photos").update({ is_primary: false }).eq("dog_id", dogId);
  const { error } = await supabase
    .from("dog_photos")
    .update({ is_primary: true })
    .eq("id", photoId);

  if (error) {
    redirect(`/manage/dogs/${dogSlug}/edit#photos`);
  }

  revalidateDogPhotoPaths(dogSlug);
  redirectWithFlash(`/manage/dogs/${dogSlug}/edit#photos`, "photo_card_updated");
}

function clamp01(n: number): number {
  if (!Number.isFinite(n)) return 0.5;
  return Math.max(0, Math.min(1, n));
}

export async function updateDogPhotoFocalAction(
  _prev: DogPhotoFormState,
  formData: FormData,
): Promise<DogPhotoFormState> {
  await requirePrivileged();
  const dogId = String(formData.get("dog_id") ?? "").trim();
  const dogSlug = String(formData.get("dog_slug") ?? "").trim();
  const photoId = String(formData.get("photo_id") ?? "").trim();
  const focal_x = clamp01(Number(formData.get("focal_x")));
  const focal_y = clamp01(Number(formData.get("focal_y")));

  if (!dogId || !dogSlug || !photoId) {
    return { error: "Missing dog or photo." };
  }

  const supabase = await createClient();

  const { data: row } = await supabase
    .from("dog_photos")
    .select("id, dog_id")
    .eq("id", photoId)
    .maybeSingle();
  if (!row || row.dog_id !== dogId) {
    return { error: "Photo not found for this dog." };
  }

  const { error } = await supabase
    .from("dog_photos")
    .update({ focal_x, focal_y })
    .eq("id", photoId)
    .eq("dog_id", dogId);

  if (error) return { error: error.message };

  revalidateDogPhotoPaths(dogSlug);
  redirectWithFlash(`/manage/dogs/${dogSlug}/edit#photos`, "photo_framing_saved");
}

export async function deleteDogPhotoAction(formData: FormData) {
  await requirePrivileged();
  const dogId = String(formData.get("dog_id") ?? "").trim();
  const dogSlug = String(formData.get("dog_slug") ?? "").trim();
  const photoId = String(formData.get("photo_id") ?? "").trim();
  if (!dogId || !dogSlug || !photoId) {
    redirect("/manage/dogs");
  }

  const supabase = await createClient();

  const { data: row } = await supabase
    .from("dog_photos")
    .select("id, dog_id, cloudinary_public_id")
    .eq("id", photoId)
    .maybeSingle();
  if (!row || row.dog_id !== dogId) {
    redirect(`/manage/dogs/${dogSlug}/edit#photos`);
  }

  const cloudId = row.cloudinary_public_id;

  const { error } = await supabase.from("dog_photos").delete().eq("id", photoId);
  if (error) {
    redirect(`/manage/dogs/${dogSlug}/edit#photos`);
  }

  if (cloudId && isCloudinaryConfigured()) {
    try {
      await deleteCloudinaryImage(cloudId);
    } catch {
      /* keep DB delete; clean up in Cloudinary dashboard if needed */
    }
  }

  revalidateDogPhotoPaths(dogSlug);
  redirectWithFlash(`/manage/dogs/${dogSlug}/edit#photos`, "photo_removed");
}
