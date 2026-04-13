"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { requirePrivileged } from "@/lib/auth/require-privileged";
import { recordWelfareStatusChange } from "@/lib/dogs/record-welfare-status-event";
import { syncDogCarers } from "@/lib/dogs/dog-carers-sync";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const EVENT_TYPES = ["vaccination", "neutering", "vet_visit", "other"] as const;

function missingWelfareRemarksColumn(err: { message?: string }): boolean {
  return (err.message ?? "").toLowerCase().includes("welfare_remarks");
}

/** Only keys present are applied; each dog is merged with their current row. */
export type BulkEditProfilePatch = Partial<{
  gender: string;
  neutering_status: string;
  welfare_status: string;
  welfare_remarks: string | null;
  estimated_death_year: number | null;
}>;

export type BulkEditLocationPatch = Partial<{
  neighbourhood_id: string;
  street_name: string | null;
  landmark: string | null;
  map_lat: number | null;
  map_lng: number | null;
}>;

export type BulkEditMedicalPatch = {
  event_type: string;
  occurred_on: string;
  next_due_date: string | null;
  description: string | null;
};

export type BulkEditCommitPayload = {
  dogIds: string[];
  profile?: BulkEditProfilePatch;
  location?: BulkEditLocationPatch;
  medical?: BulkEditMedicalPatch;
  /** When set (including `[]`), replaces carers for every selected dog. Omit to leave carers unchanged. */
  carers?: string[];
};

export type BulkEditCommitResult =
  | {
      ok: true;
      updated: number;
      medicalAdded: number;
      carersSynced: number;
      skipped: { id: string; reason: string }[];
    }
  | { ok: false; error: string };

type DogBulkRow = {
  id: string;
  slug: string;
  status: string;
  welfare_status: string | null;
  gender: string | null;
  neutering_status: string | null;
  welfare_remarks: string | null;
  estimated_death_year: number | null;
  neighbourhood_id: string | null;
  street_name: string | null;
  landmark: string | null;
  map_lat: number | null;
  map_lng: number | null;
};

function validateProfilePatchKeys(p: BulkEditProfilePatch): string | null {
  if (p.gender !== undefined && !["male", "female", "unknown"].includes(p.gender)) {
    return "Invalid gender.";
  }
  if (
    p.neutering_status !== undefined &&
    !["neutered", "not_neutered", "unknown"].includes(p.neutering_status)
  ) {
    return "Invalid sterilisation status.";
  }
  if (
    p.welfare_status !== undefined &&
    !["healthy", "needs_attention", "injured", "missing", "deceased"].includes(p.welfare_status)
  ) {
    return "Invalid welfare status.";
  }
  if (p.estimated_death_year !== undefined && p.estimated_death_year != null) {
    const y = new Date().getFullYear();
    if (!Number.isFinite(p.estimated_death_year) || p.estimated_death_year < 1980 || p.estimated_death_year > y) {
      return "Estimated death year must be between 1980 and the current year.";
    }
  }
  return null;
}

export async function commitBulkDogEdit(json: string): Promise<BulkEditCommitResult> {
  await requirePrivileged("/manage/dogs/bulk-edit");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not signed in." };

  let payload: BulkEditCommitPayload;
  try {
    payload = JSON.parse(json) as BulkEditCommitPayload;
  } catch {
    return { ok: false, error: "Invalid payload." };
  }

  const dogIds = [...new Set((payload.dogIds ?? []).filter((id) => UUID_RE.test(id)))];
  if (dogIds.length === 0) return { ok: false, error: "Select at least one dog." };

  const hasProfile = !!(payload.profile && Object.keys(payload.profile).length > 0);
  const hasLocation = !!(payload.location && Object.keys(payload.location).length > 0);
  const hasCarers = payload.carers !== undefined;

  function validateCarerIds(ids: string[]): string | null {
    for (const id of ids) {
      if (!UUID_RE.test(id)) return "Invalid carer id.";
    }
    return null;
  }
  if (hasCarers && payload.carers) {
    const err = validateCarerIds(payload.carers);
    if (err) return { ok: false, error: err };
  }

  if (hasProfile) {
    const err = validateProfilePatchKeys(payload.profile!);
    if (err) return { ok: false, error: err };
  }

  if (hasLocation && payload.location && "neighbourhood_id" in payload.location) {
    const nb = String(payload.location.neighbourhood_id ?? "").trim();
    if (nb) {
      const { data: hood } = await supabase.from("neighbourhoods").select("id").eq("id", nb).maybeSingle();
      if (!hood) return { ok: false, error: "Invalid neighbourhood." };
    }
  }

  if (payload.medical) {
    const m = payload.medical;
    if (!EVENT_TYPES.includes(m.event_type as (typeof EVENT_TYPES)[number])) {
      return { ok: false, error: "Invalid medical event type." };
    }
    if (!String(m.occurred_on ?? "").trim()) return { ok: false, error: "Medical event date is required." };
  }

  const skipped: { id: string; reason: string }[] = [];
  let updated = 0;
  let medicalAdded = 0;
  let carersSynced = 0;
  const slugsToRevalidate = new Set<string>();

  for (const dogId of dogIds) {
    const { data: dog, error: dogErr } = await supabase
      .from("dogs")
      .select(
        "id, slug, status, welfare_status, gender, neutering_status, welfare_remarks, estimated_death_year, neighbourhood_id, street_name, landmark, map_lat, map_lng",
      )
      .eq("id", dogId)
      .maybeSingle();

    if (dogErr || !dog) {
      skipped.push({ id: dogId, reason: "Dog not found." });
      continue;
    }

    const d = dog as DogBulkRow;
    slugsToRevalidate.add(d.slug);

    const failReasons: string[] = [];
    let profileOk = !hasProfile;
    let locationOk = !hasLocation;

    if (hasProfile && payload.profile) {
      profileOk = false;
      const p = payload.profile;
      const priorWelfare = d.welfare_status ?? "healthy";
      const mergedGender = p.gender ?? d.gender ?? "unknown";
      const mergedNeuter = p.neutering_status ?? d.neutering_status ?? "unknown";
      const mergedWelfare = p.welfare_status ?? d.welfare_status ?? "healthy";
      const mergedRemarks =
        p.welfare_remarks !== undefined ? p.welfare_remarks : d.welfare_remarks ?? null;
      let mergedDeath: number | null =
        p.estimated_death_year !== undefined ? p.estimated_death_year : d.estimated_death_year ?? null;
      if (mergedWelfare !== "deceased") mergedDeath = null;

      const enumErr = validateProfilePatchKeys({
        gender: mergedGender,
        neutering_status: mergedNeuter,
        welfare_status: mergedWelfare,
        ...(mergedDeath != null ? { estimated_death_year: mergedDeath } : {}),
      });
      if (enumErr) {
        failReasons.push(`Profile: ${enumErr}`);
      } else if (mergedWelfare === "deceased") {
        if (mergedDeath == null || !Number.isFinite(Number(mergedDeath))) {
          failReasons.push(
            "Profile: estimated death year is required when welfare is deceased (set it in bulk or on the dog first).",
          );
        } else {
          const patch: Record<string, unknown> = {
            gender: mergedGender,
            neutering_status: mergedNeuter,
            welfare_status: mergedWelfare,
            welfare_remarks: mergedRemarks,
            estimated_death_year: mergedDeath,
          };
          let { error: upErr } = await supabase.from("dogs").update(patch).eq("id", dogId);
          if (upErr && missingWelfareRemarksColumn(upErr)) {
            const { welfare_remarks: _wr, ...withoutRemarks } = patch;
            void _wr;
            ({ error: upErr } = await supabase.from("dogs").update(withoutRemarks).eq("id", dogId));
          }
          if (upErr) {
            failReasons.push(`Profile: ${upErr.message}`);
          } else {
            profileOk = true;
            await recordWelfareStatusChange(supabase, {
              dogId,
              fromStatus: priorWelfare,
              toStatus: mergedWelfare,
              note: mergedRemarks,
              changedBy: user.id,
            });
          }
        }
      } else {
        const patch: Record<string, unknown> = {
          gender: mergedGender,
          neutering_status: mergedNeuter,
          welfare_status: mergedWelfare,
          welfare_remarks: mergedRemarks,
          estimated_death_year: null,
        };
        let { error: upErr } = await supabase.from("dogs").update(patch).eq("id", dogId);
        if (upErr && missingWelfareRemarksColumn(upErr)) {
          const { welfare_remarks: _wr, ...withoutRemarks } = patch;
          void _wr;
          ({ error: upErr } = await supabase.from("dogs").update(withoutRemarks).eq("id", dogId));
        }
        if (upErr) {
          failReasons.push(`Profile: ${upErr.message}`);
        } else {
          profileOk = true;
          await recordWelfareStatusChange(supabase, {
            dogId,
            fromStatus: priorWelfare,
            toStatus: mergedWelfare,
            note: mergedRemarks,
            changedBy: user.id,
          });
        }
      }
    }

    if (hasLocation && payload.location) {
      locationOk = false;
      const loc = payload.location;
      const mergedNbRaw =
        "neighbourhood_id" in loc && loc.neighbourhood_id
          ? String(loc.neighbourhood_id).trim()
          : d.neighbourhood_id
            ? String(d.neighbourhood_id).trim()
            : "";
      const mergedNb = mergedNbRaw && UUID_RE.test(mergedNbRaw) ? mergedNbRaw : "";

      const needsNb =
        "neighbourhood_id" in loc ||
        "street_name" in loc ||
        "landmark" in loc ||
        "map_lat" in loc ||
        "map_lng" in loc;

      if (needsNb && !mergedNb) {
        failReasons.push(
          "Location: choose a neighbourhood (or ensure the dog already has one) before changing street, landmark, or map.",
        );
      } else if (!needsNb) {
        locationOk = true;
      } else {
        const mergedStreet = "street_name" in loc ? loc.street_name ?? null : d.street_name ?? null;
        const mergedLandmark = "landmark" in loc ? loc.landmark ?? null : d.landmark ?? null;
        const mergedLat = "map_lat" in loc ? loc.map_lat : d.map_lat ?? null;
        const mergedLng = "map_lng" in loc ? loc.map_lng : d.map_lng ?? null;

        const { data: nbRow } = await supabase
          .from("neighbourhoods")
          .select("locality_id")
          .eq("id", mergedNb)
          .maybeSingle();

        const locationPatch: Record<string, unknown> = {
          neighbourhood_id: mergedNb,
          street_name: mergedStreet,
          landmark: mergedLandmark,
          map_lat: mergedLat,
          map_lng: mergedLng,
        };
        if (nbRow?.locality_id) {
          locationPatch.locality_id = nbRow.locality_id;
        }

        let { error: locErr } = await supabase.from("dogs").update(locationPatch).eq("id", dogId);
        if (locErr && String(locErr.message).toLowerCase().includes("locality_id")) {
          const { locality_id: _lid, ...withoutLocality } = locationPatch;
          void _lid;
          ({ error: locErr } = await supabase.from("dogs").update(withoutLocality).eq("id", dogId));
        }
        if (locErr) {
          failReasons.push(`Location: ${locErr.message}`);
        } else {
          locationOk = true;
        }
      }
    }

    if (failReasons.length > 0) {
      skipped.push({ id: dogId, reason: failReasons.join(" ") });
    }
    if ((hasProfile || hasLocation) && profileOk && locationOk) {
      updated += 1;
    }

    if (payload.medical && d.status === "active") {
      const m = payload.medical;
      const { error: medErr } = await supabase.from("medical_records").insert({
        dog_id: dogId,
        event_type: m.event_type,
        occurred_on: m.occurred_on.trim(),
        description: m.description,
        description_snapshot: m.description,
        next_due_date: m.next_due_date,
        recorded_by: user.id,
      });
      if (medErr) {
        skipped.push({ id: dogId, reason: `Medical: ${medErr.message}` });
      } else {
        medicalAdded += 1;
      }
    } else     if (payload.medical && d.status !== "active") {
      skipped.push({ id: dogId, reason: "Medical skipped (dog is not active)." });
    }

    if (hasCarers && payload.carers !== undefined) {
      const syncRes = await syncDogCarers({
        supabase,
        dogId,
        actorUserId: user.id,
        requestedCarerIds: payload.carers,
      });
      if (syncRes.error) {
        skipped.push({ id: dogId, reason: `Carers: ${syncRes.error}` });
      } else {
        carersSynced += 1;
      }
    }
  }

  revalidatePath("/");
  revalidatePath("/dogs");
  revalidatePath("/manage/dogs");
  for (const slug of slugsToRevalidate) {
    revalidatePath(`/dogs/${slug}`);
    revalidatePath(`/manage/dogs/${slug}/edit`);
  }

  return { ok: true, updated, medicalAdded, carersSynced, skipped };
}
