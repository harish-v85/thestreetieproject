"use client";

import { Camera } from "@phosphor-icons/react";
import Image from "next/image";
import { useActionState, useRef, useState } from "react";
import {
  addDogPhoto,
  deleteDogPhotoAction,
  setPrimaryDogPhotoAction,
  uploadDogPhoto,
  type DogPhotoFormState,
} from "@/app/manage/dogs/photo-actions";
import { DogPhotoFramingControls } from "@/components/dog-photo-framing-controls";
import { objectPositionFromFocal } from "@/lib/dogs/photo-focal";

const initial: DogPhotoFormState = { error: null };

export type ManagedPhoto = {
  id: string;
  url: string;
  caption: string | null;
  is_primary: boolean;
  sort_order: number;
  focal_x: number;
  focal_y: number;
  fromCloudinary?: boolean;
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function DogPhotosManager({
  dogId,
  dogSlug,
  photos,
  canUploadToCloudinary,
  /** When set, photo actions redirect here (e.g. stay on Add dog after upload). */
  redirectAfterPhotoMutation,
}: {
  dogId: string;
  dogSlug: string;
  photos: ManagedPhoto[];
  canUploadToCloudinary: boolean;
  redirectAfterPhotoMutation?: string;
}) {
  const boundAdd = addDogPhoto.bind(null, dogId, dogSlug);
  const [urlState, urlFormAction, urlPending] = useActionState(boundAdd, initial);

  const boundUpload = uploadDogPhoto.bind(null, dogId, dogSlug);
  const [uploadState, uploadFormAction, uploadPending] = useActionState(boundUpload, initial);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [reframePhotoId, setReframePhotoId] = useState<string | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [addTab, setAddTab] = useState<"upload" | "url">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pickedFile, setPickedFile] = useState<File | null>(null);
  const [urlPreviewOpen, setUrlPreviewOpen] = useState(false);
  const [urlDraft, setUrlDraft] = useState("");
  const [urlPreviewError, setUrlPreviewError] = useState(false);

  async function copyPhotoUrl(url: string, photoId: string) {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedId(photoId);
      window.setTimeout(() => setCopiedId((id) => (id === photoId ? null : id)), 2000);
    } catch {
      setCopiedId(null);
    }
  }

  function clearPickedFile() {
    setPickedFile(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <section
      id="photos"
      className="scroll-mt-24 overflow-hidden rounded-2xl border border-black/5 bg-white p-6 shadow-sm"
    >
      <h2 className="text-lg font-semibold tracking-tight -mx-6 -mt-6 rounded-t-2xl bg-[var(--table-header-bg)] px-6 py-3 text-white border-b border-white/15">
        Photos
      </h2>
      <p className="mt-4 text-sm text-[var(--muted)]">
        Multiple images show as a carousel on the public profile. The <strong>card photo</strong> is
        used on directory cards and home; if you don&apos;t pick one, the earliest upload is used
        automatically. Click <strong>Reframe</strong> on a photo to adjust what stays in view when it
        is cropped on cards and the profile. Admins and super admins can upload here (same as other
        dog edits).
      </p>
      <div className="mt-4 flex gap-3 rounded-lg border border-amber-200/90 bg-amber-50 px-3 py-2.5 text-sm text-amber-950 shadow-sm">
        <Camera className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" weight="regular" aria-hidden />
        <p className="min-w-0 leading-relaxed">
          Please ensure photos do not show identifiable landmarks, house numbers, vehicle number
          plates, or faces of people who haven&apos;t consented to being photographed. Photos should
          focus on the dog.
        </p>
      </div>

      {photos.length > 0 ? (
        <ul className="mt-6 space-y-4">
          {photos.map((p) => (
            <li
              key={p.id}
              className="flex flex-col gap-3 rounded-xl border border-black/5 bg-[var(--background)]/40 p-3 sm:flex-row sm:items-start"
            >
              <div className="relative h-28 w-40 shrink-0 overflow-hidden rounded-lg bg-black/5">
                <Image
                  src={p.url}
                  alt={p.caption ? `Preview: ${p.caption}` : "Photo preview"}
                  fill
                  className="object-cover"
                  style={{ objectPosition: objectPositionFromFocal(p.focal_x, p.focal_y) }}
                  sizes="160px"
                  unoptimized
                />
              </div>
              <div className="min-w-0 flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  {p.fromCloudinary ? (
                    <span className="rounded-full bg-sky-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sky-900">
                      Cloudinary
                    </span>
                  ) : null}
                  {p.is_primary ? (
                    <span className="rounded-full bg-[var(--accent)]/15 px-2 py-0.5 text-xs font-medium text-[var(--accent)]">
                      Card photo
                    </span>
                  ) : null}
                </div>
                <p
                  className={
                    p.caption?.trim()
                      ? "text-sm text-[var(--foreground)]"
                      : "text-sm italic text-[var(--muted)]"
                  }
                >
                  {p.caption?.trim() ? p.caption : "No caption"}
                </p>
                <div className="flex flex-wrap gap-2 pt-1">
                  {!p.is_primary ? (
                    <form action={setPrimaryDogPhotoAction}>
                      <input type="hidden" name="dog_id" value={dogId} />
                      <input type="hidden" name="dog_slug" value={dogSlug} />
                      <input type="hidden" name="photo_id" value={p.id} />
                      {redirectAfterPhotoMutation ? (
                        <input type="hidden" name="return_to" value={redirectAfterPhotoMutation} />
                      ) : null}
                      <button
                        type="submit"
                        className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background)]"
                      >
                        Use as card photo
                      </button>
                    </form>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => copyPhotoUrl(p.url, p.id)}
                    className="rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background)]"
                  >
                    {copiedId === p.id ? "Copied" : "Copy URL"}
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setReframePhotoId((id) => (id === p.id ? null : p.id))
                    }
                    className={
                      reframePhotoId === p.id
                        ? "rounded-lg border border-[var(--accent)]/40 bg-[var(--accent)]/10 px-3 py-1.5 text-sm font-medium text-[var(--accent)]"
                        : "rounded-lg border border-black/10 bg-white px-3 py-1.5 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background)]"
                    }
                  >
                    Reframe
                  </button>
                  <form action={deleteDogPhotoAction}>
                    <input type="hidden" name="dog_id" value={dogId} />
                    <input type="hidden" name="dog_slug" value={dogSlug} />
                    <input type="hidden" name="photo_id" value={p.id} />
                    {redirectAfterPhotoMutation ? (
                      <input type="hidden" name="return_to" value={redirectAfterPhotoMutation} />
                    ) : null}
                    <button
                      type="submit"
                      className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100"
                      onClick={(e) => {
                        if (!confirm("Remove this photo from the profile?")) e.preventDefault();
                      }}
                    >
                      Remove
                    </button>
                  </form>
                </div>
                {reframePhotoId === p.id ? (
                  <DogPhotoFramingControls
                    key={p.id}
                    dogId={dogId}
                    dogSlug={dogSlug}
                    photoId={p.id}
                    imageUrl={p.url}
                    focalX={p.focal_x}
                    focalY={p.focal_y}
                    returnTo={redirectAfterPhotoMutation}
                    onCancel={() => setReframePhotoId(null)}
                  />
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-xl border border-black/5 bg-[var(--background)]/40 px-4 py-6 text-center shadow-sm">
          <p className="text-sm font-medium text-[var(--foreground)]">No photos yet</p>
          <p className="mt-1 text-xs text-[var(--muted)]">
            Add a photo below when you&apos;re ready — upload a file or paste an image URL.
          </p>
        </div>
      )}

      <div className="mt-8 border-t border-black/5 pt-8">
        {!showAdd ? (
          <button
            type="button"
            onClick={() => setShowAdd(true)}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-black/10 bg-white px-4 py-3 text-sm font-medium text-[var(--foreground)] shadow-sm hover:bg-[var(--background)]"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="h-5 w-5 shrink-0"
              aria-hidden
            >
              <path d="M12 5v14M5 12h14" strokeLinecap="round" />
            </svg>
            Add new photo
          </button>
        ) : (
          <div className="rounded-xl border border-black/5 bg-[var(--background)]/30 p-4">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
              <div className="flex gap-1 rounded-lg border border-black/10 bg-white p-0.5 text-sm">
                <button
                  type="button"
                  onClick={() => setAddTab("upload")}
                  className={
                    addTab === "upload"
                      ? "rounded-md bg-[var(--accent)]/15 px-3 py-1.5 font-medium text-[var(--accent)]"
                      : "rounded-md px-3 py-1.5 text-[var(--muted)] hover:text-[var(--foreground)]"
                  }
                >
                  Upload
                </button>
                <button
                  type="button"
                  onClick={() => setAddTab("url")}
                  className={
                    addTab === "url"
                      ? "rounded-md bg-[var(--accent)]/15 px-3 py-1.5 font-medium text-[var(--accent)]"
                      : "rounded-md px-3 py-1.5 text-[var(--muted)] hover:text-[var(--foreground)]"
                  }
                >
                  Paste URL
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowAdd(false);
                  clearPickedFile();
                  setUrlDraft("");
                  setUrlPreviewOpen(false);
                }}
                className="text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
              >
                Close
              </button>
            </div>

            {addTab === "upload" && canUploadToCloudinary ? (
              <div>
                <p className="text-xs text-[var(--muted)]">
                  JPEG, PNG, WebP, or GIF — max 5 MB. Stored in your Cloudinary folder{" "}
                  <span className="font-mono">streetie/dogs</span>.
                </p>
                <form action={uploadFormAction} className="mt-4 space-y-3">
                  {redirectAfterPhotoMutation ? (
                    <input type="hidden" name="return_to" value={redirectAfterPhotoMutation} />
                  ) : null}
                  <div>
                    <label className="mb-1 block text-sm font-medium">
                      File <span className="text-red-600">*</span>
                    </label>
                    <input
                      ref={fileInputRef}
                      name="file"
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      required={!pickedFile}
                      className="sr-only"
                      onChange={(e) => setPickedFile(e.target.files?.[0] ?? null)}
                    />
                    {!pickedFile ? (
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full max-w-md rounded-lg border border-dashed border-black/20 bg-white px-4 py-8 text-sm font-medium text-[var(--foreground)] hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/5"
                      >
                        Choose file
                      </button>
                    ) : (
                      <div className="flex w-full max-w-md flex-col gap-2 rounded-lg border border-black/10 bg-white px-4 py-3">
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-[var(--foreground)]">
                            {pickedFile.name}
                          </p>
                          <p className="text-xs text-[var(--muted)]">{formatFileSize(pickedFile.size)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={clearPickedFile}
                          className="self-start rounded-lg border border-black/10 px-3 py-1.5 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--background)]"
                        >
                          Remove chosen file
                        </button>
                      </div>
                    )}
                  </div>
                  <div>
                    <label htmlFor="upload_photo_caption" className="mb-1 block text-sm font-medium">
                      Caption <span className="font-normal text-[var(--muted)]">(optional)</span>
                    </label>
                    <input
                      id="upload_photo_caption"
                      name="caption"
                      type="text"
                      className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
                    />
                  </div>
                  {uploadState.error ? (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
                      {uploadState.error}
                    </p>
                  ) : null}
                  <button
                    type="submit"
                    disabled={uploadPending || !pickedFile}
                    className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
                  >
                    {uploadPending ? "Uploading…" : "Upload & add to profile"}
                  </button>
                </form>
              </div>
            ) : null}

            {addTab === "upload" && !canUploadToCloudinary ? (
              <div className="rounded-lg border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950">
                <p className="font-medium">Uploads disabled</p>
                <p className="mt-1 text-xs text-amber-900/90">
                  Add <span className="font-mono">CLOUDINARY_URL=cloudinary://…</span> from Cloudinary →
                  API Keys (or the three separate vars — see{" "}
                  <span className="font-mono">.env.local.example</span>), then restart the dev server.
                </p>
              </div>
            ) : null}

            {addTab === "url" ? (
              <div>
                <p className="text-xs text-[var(--muted)]">Use this for images already hosted elsewhere.</p>
                <form action={urlFormAction} className="mt-4 space-y-3">
                  {redirectAfterPhotoMutation ? (
                    <input type="hidden" name="return_to" value={redirectAfterPhotoMutation} />
                  ) : null}
                  <div>
                    <label htmlFor="new_photo_url" className="mb-1 block text-sm font-medium">
                      Image URL <span className="text-red-600">*</span>
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <input
                        id="new_photo_url"
                        name="url"
                        type="url"
                        required
                        value={urlDraft}
                        onChange={(e) => {
                          setUrlDraft(e.target.value);
                          setUrlPreviewOpen(false);
                          setUrlPreviewError(false);
                        }}
                        placeholder="https://…"
                        className="min-w-[12rem] flex-1 rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setUrlPreviewError(false);
                          setUrlPreviewOpen(true);
                        }}
                        className="rounded-lg border border-black/10 bg-white px-3 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background)]"
                      >
                        Show preview
                      </button>
                    </div>
                    {urlPreviewOpen ? (
                      <div className="mt-3 rounded-lg border border-black/10 bg-[var(--background)] p-3">
                        {(() => {
                          try {
                            const u = new URL(urlDraft.trim());
                            if (!u.protocol.startsWith("http")) {
                              return (
                                <p className="text-sm text-red-800">Enter a valid http(s) URL.</p>
                              );
                            }
                            if (urlPreviewError) {
                              return (
                                <p className="text-sm text-red-800">
                                  Could not load an image from this URL. Check the link or CORS
                                  restrictions.
                                </p>
                              );
                            }
                            return (
                              <div className="relative mx-auto max-h-64 w-full max-w-md overflow-hidden rounded-md bg-black/5">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={urlDraft.trim()}
                                  alt="URL preview"
                                  className="mx-auto max-h-64 w-auto object-contain"
                                  onLoad={() => setUrlPreviewError(false)}
                                  onError={() => setUrlPreviewError(true)}
                                />
                              </div>
                            );
                          } catch {
                            return (
                              <p className="text-sm text-red-800">
                                That doesn&apos;t look like a valid URL yet.
                              </p>
                            );
                          }
                        })()}
                      </div>
                    ) : null}
                  </div>
                  <div>
                    <label htmlFor="new_photo_caption" className="mb-1 block text-sm font-medium">
                      Caption <span className="font-normal text-[var(--muted)]">(optional)</span>
                    </label>
                    <input
                      id="new_photo_caption"
                      name="caption"
                      type="text"
                      className="w-full rounded-lg border border-black/10 bg-white px-3 py-2 outline-none ring-[var(--accent)] focus:ring-2"
                    />
                  </div>
                  {urlState.error ? (
                    <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
                      {urlState.error}
                    </p>
                  ) : null}
                  <button
                    type="submit"
                    disabled={urlPending}
                    className="rounded-lg border border-black/15 bg-white px-4 py-2 text-sm font-medium text-[var(--foreground)] hover:bg-[var(--background)] disabled:opacity-60"
                  >
                    {urlPending ? "Adding…" : "Add from URL"}
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        )}
      </div>
    </section>
  );
}
