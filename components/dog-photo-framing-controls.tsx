"use client";

import Image from "next/image";
import { useActionState, useEffect, useState } from "react";
import {
  updateDogPhotoFocalAction,
  type DogPhotoFormState,
} from "@/app/manage/dogs/photo-actions";
import { clampFocal, objectPositionFromFocal } from "@/lib/dogs/photo-focal";

const initial: DogPhotoFormState = { error: null };

export function DogPhotoFramingControls({
  dogId,
  dogSlug,
  photoId,
  imageUrl,
  focalX: initialFx,
  focalY: initialFy,
  onCancel,
}: {
  dogId: string;
  dogSlug: string;
  photoId: string;
  imageUrl: string;
  focalX: number;
  focalY: number;
  onCancel: () => void;
}) {
  const [state, formAction, pending] = useActionState(updateDogPhotoFocalAction, initial);
  const [fx, setFx] = useState(() => clampFocal(initialFx));
  const [fy, setFy] = useState(() => clampFocal(initialFy));

  useEffect(() => {
    setFx(clampFocal(initialFx));
    setFy(clampFocal(initialFy));
  }, [initialFx, initialFy, photoId]);

  function setFromClientXY(clientX: number, clientY: number, rect: DOMRect) {
    const x = (clientX - rect.left) / rect.width;
    const y = (clientY - rect.top) / rect.height;
    setFx(clampFocal(x));
    setFy(clampFocal(y));
  }

  return (
    <div className="rounded-lg border border-black/5 bg-white/60 p-3">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium text-[var(--foreground)]">Card & profile framing</p>
        <button
          type="button"
          onClick={onCancel}
          className="shrink-0 rounded-md px-2 py-0.5 text-[11px] font-medium text-[var(--muted)] hover:bg-black/5 hover:text-[var(--foreground)]"
        >
          Close
        </button>
      </div>
      <p className="mt-0.5 text-[11px] text-[var(--muted)]">
        Tap or drag on the preview where the face (or main subject) should stay visible. Matches
        the 4:3 crop used on listings.
      </p>
      <div
        className="relative mt-2 aspect-[4/3] w-full max-w-xs cursor-crosshair touch-none overflow-hidden rounded-lg border border-black/10 bg-black/5"
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          e.currentTarget.setPointerCapture(e.pointerId);
          const rect = e.currentTarget.getBoundingClientRect();
          setFromClientXY(e.clientX, e.clientY, rect);
        }}
        onPointerMove={(e) => {
          if (!e.currentTarget.hasPointerCapture(e.pointerId)) return;
          const rect = e.currentTarget.getBoundingClientRect();
          setFromClientXY(e.clientX, e.clientY, rect);
        }}
      >
        <Image
          src={imageUrl}
          alt=""
          fill
          className="object-cover"
          style={{ objectPosition: objectPositionFromFocal(fx, fy) }}
          sizes="320px"
          draggable={false}
          unoptimized
        />
        <span
          className="pointer-events-none absolute z-10 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-[var(--accent)] shadow-md ring-1 ring-black/20"
          style={{ left: `${fx * 100}%`, top: `${fy * 100}%` }}
          aria-hidden
        />
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <label className="block text-[11px] text-[var(--muted)]">
          Horizontal
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(fx * 100)}
            onChange={(e) => setFx(clampFocal(Number(e.target.value) / 100))}
            className="mt-1 block w-full accent-[var(--accent)]"
          />
        </label>
        <label className="block text-[11px] text-[var(--muted)]">
          Vertical
          <input
            type="range"
            min={0}
            max={100}
            value={Math.round(fy * 100)}
            onChange={(e) => setFy(clampFocal(Number(e.target.value) / 100))}
            className="mt-1 block w-full accent-[var(--accent)]"
          />
        </label>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => {
            setFx(0.5);
            setFy(0.5);
          }}
          className="rounded-md border border-black/10 bg-white px-2.5 py-1 text-xs font-medium text-[var(--foreground)] hover:bg-[var(--background)]"
        >
          Reset to center
        </button>
        <form action={formAction} className="inline">
          <input type="hidden" name="dog_id" value={dogId} />
          <input type="hidden" name="dog_slug" value={dogSlug} />
          <input type="hidden" name="photo_id" value={photoId} />
          <input type="hidden" name="focal_x" value={String(fx)} />
          <input type="hidden" name="focal_y" value={String(fy)} />
          <button
            type="submit"
            disabled={pending}
            className="rounded-md bg-[var(--accent)] px-2.5 py-1 text-xs font-medium text-white disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save framing"}
          </button>
        </form>
      </div>
      {state.error ? (
        <p className="mt-2 text-xs text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
    </div>
  );
}
