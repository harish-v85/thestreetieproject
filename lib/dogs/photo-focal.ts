/** Clamp focal coordinates used for CSS object-position (0–1). */
export function clampFocal(n: number): number {
  if (!Number.isFinite(n)) return 0.5;
  return Math.max(0, Math.min(1, n));
}

/** CSS object-position string from stored focal (defaults to center). */
export function objectPositionFromFocal(
  focalX: number | null | undefined,
  focalY: number | null | undefined,
): string {
  const x = clampFocal(focalX ?? 0.5);
  const y = clampFocal(focalY ?? 0.5);
  return `${x * 100}% ${y * 100}%`;
}

export type CardPhotoPickRow = {
  url: string;
  is_primary: boolean | null;
  sort_order: number | null;
  uploaded_at: string;
  focal_x?: number | null;
  focal_y?: number | null;
};

/** Same ordering as card / directory thumbnail (primary → sort_order → uploaded_at). */
export function pickCardPhoto<T extends CardPhotoPickRow>(rows: T[]): T | null {
  if (!rows.length) return null;
  return [...rows].sort((a, b) => {
    if (a.is_primary && !b.is_primary) return -1;
    if (!a.is_primary && b.is_primary) return 1;
    const so = (a.sort_order ?? 0) - (b.sort_order ?? 0);
    if (so !== 0) return so;
    return new Date(a.uploaded_at).getTime() - new Date(b.uploaded_at).getTime();
  })[0]!;
}

/** Photo row from `dog_photos` joined by `dog_id` (e.g. `.in("dog_id", ids)`). */
export type DogPhotoThumbRow = CardPhotoPickRow & { dog_id: string };

export function thumbForDogId(
  dogId: string,
  rows: DogPhotoThumbRow[],
): { url: string; focalX: number; focalY: number } | null {
  const ps = rows.filter((p) => p.dog_id === dogId);
  const picked = pickCardPhoto(ps);
  if (!picked) return null;
  return {
    url: picked.url,
    focalX: Number(picked.focal_x ?? 0.5),
    focalY: Number(picked.focal_y ?? 0.5),
  };
}
