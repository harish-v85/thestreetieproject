import type { createClient } from "@/lib/supabase/server";
import { recorderNameMap } from "@/lib/dogs/recorder-name-map";

type ServerSupabase = Awaited<ReturnType<typeof createClient>>;

export const ACTIVITY_KINDS = [
  "dog_added",
  "dog_profile_updated",
  "feeding_logged",
  "welfare_updated",
  "medical_added",
  "medical_updated",
] as const;

export type ActivityKind = (typeof ACTIVITY_KINDS)[number];

export type ActivityFeedItem = {
  id: string;
  kind: ActivityKind;
  at: string;
  dogId: string;
  dogSlug: string;
  dogName: string;
  actorId: string | null;
  actorName: string | null;
  title: string;
  detail: string | null;
  href: string;
};

const PROFILE_EDIT_MIN_MS = 2_000;
/** Skip generic “profile updated” when a welfare event exists within this window (same save). */
const WELFARE_DEDUPE_MS = 8_000;

function welfareLabel(status: string): string {
  const m: Record<string, string> = {
    healthy: "Healthy",
    needs_attention: "Needs attention",
    injured: "Injured",
    missing: "Missing",
    deceased: "Deceased",
  };
  return m[status] ?? status;
}

function medicalEventLabel(t: string): string {
  const m: Record<string, string> = {
    vaccination: "Vaccination",
    neutering: "Neutering",
    vet_visit: "Vet visit",
    other: "Other",
  };
  return m[t] ?? t;
}

/** Event type label plus optional notes (description), truncated like welfare notes. */
function medicalDetailSnippet(eventType: string, description: string | null | undefined): string {
  const label = medicalEventLabel(eventType);
  const d = description?.trim();
  if (!d) return label;
  const slice = d.length > 120 ? `${d.slice(0, 120)}…` : d;
  return `${label} — ${slice}`;
}

function dayStartUtc(isoDate: string): string {
  return `${isoDate.trim()}T00:00:00.000Z`;
}

function dayEndUtc(isoDate: string): string {
  return `${isoDate.trim()}T23:59:59.999Z`;
}

function wants(kind: ActivityKind, filter: ActivityKind[] | "all"): boolean {
  return filter === "all" || filter.includes(kind);
}

/** @internal */
export function defaultActivityDateRange(): { from: string; to: string } {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - 30);
  return {
    from: start.toISOString().slice(0, 10),
    to: end.toISOString().slice(0, 10),
  };
}

export function parseActivityKindsParam(raw: string | undefined): ActivityKind[] | "all" {
  if (raw == null || raw === "" || raw === "all") return "all";
  const parts = raw.split(",").map((s) => s.trim()).filter(Boolean);
  const set = new Set<ActivityKind>();
  for (const p of parts) {
    if ((ACTIVITY_KINDS as readonly string[]).includes(p)) set.add(p as ActivityKind);
  }
  return set.size === 0 ? "all" : [...set];
}

export async function loadActivityFeed(
  supabase: ServerSupabase,
  opts: {
    fromDay: string;
    toDay: string;
    kinds: ActivityKind[] | "all";
  },
): Promise<{ items: ActivityFeedItem[]; truncated: boolean }> {
  const fromIso = dayStartUtc(opts.fromDay);
  const toIso = dayEndUtc(opts.toDay);

  const items: ActivityFeedItem[] = [];
  const k = opts.kinds;

  const dogRows: {
    id: string;
    slug: string;
    name: string;
    created_at: string;
    updated_at: string;
  }[] = [];

  if (wants("dog_added", k) || wants("dog_profile_updated", k)) {
    const { data: created, error: e1 } = await supabase
      .from("dogs")
      .select("id, slug, name, created_at, updated_at")
      .gte("created_at", fromIso)
      .lte("created_at", toIso)
      .limit(1500);
    const { data: updated, error: e2 } = await supabase
      .from("dogs")
      .select("id, slug, name, created_at, updated_at")
      .gte("updated_at", fromIso)
      .lte("updated_at", toIso)
      .limit(1500);

    if (e1) console.error("[activity feed] dogs created", e1.message);
    if (e2) console.error("[activity feed] dogs updated", e2.message);

    const byId = new Map<string, (typeof dogRows)[0]>();
    for (const d of [...(created ?? []), ...(updated ?? [])] as typeof dogRows) {
      byId.set(d.id, d);
    }
    dogRows.push(...byId.values());
  }

  const dogById = new Map(dogRows.map((d) => [d.id, d]));

  if (wants("dog_added", k)) {
    for (const d of dogRows) {
      const c = new Date(d.created_at).getTime();
      if (c >= new Date(fromIso).getTime() && c <= new Date(toIso).getTime()) {
        items.push({
          id: `dog_added-${d.id}`,
          kind: "dog_added",
          at: d.created_at,
          dogId: d.id,
          dogSlug: d.slug,
          dogName: d.name,
          actorId: null,
          actorName: null,
          title: "Dog added",
          detail: d.name,
          href: `/dogs/${d.slug}`,
        });
      }
    }
  }

  let welfareInRange: {
    id: string;
    dog_id: string;
    from_status: string | null;
    to_status: string;
    note: string | null;
    changed_at: string;
    changed_by: string | null;
  }[] = [];

  if (wants("welfare_updated", k) || wants("dog_profile_updated", k)) {
    const { data, error } = await supabase
      .from("welfare_status_events")
      .select("id, dog_id, from_status, to_status, note, changed_at, changed_by")
      .gte("changed_at", fromIso)
      .lte("changed_at", toIso)
      .order("changed_at", { ascending: false })
      .limit(1500);

    if (error) {
      console.error("[activity feed] welfare_status_events", error.message);
    } else {
      welfareInRange = (data ?? []) as typeof welfareInRange;
    }
  }

  const missingWelfareDogIds = welfareInRange
    .map((w) => w.dog_id)
    .filter((id) => !dogById.has(id));
  if (missingWelfareDogIds.length > 0) {
    const { data: extraDogs } = await supabase
      .from("dogs")
      .select("id, slug, name, created_at, updated_at")
      .in("id", [...new Set(missingWelfareDogIds)]);
    for (const d of (extraDogs ?? []) as (typeof dogRows)[0][]) {
      dogById.set(d.id, d);
    }
  }

  if (wants("welfare_updated", k)) {
    for (const w of welfareInRange) {
      const dog = dogById.get(w.dog_id);
      const slug = dog?.slug;
      const name = dog?.name ?? "Dog";
      if (!slug) continue;
      const fromL = w.from_status ? welfareLabel(w.from_status) : "—";
      const toL = welfareLabel(w.to_status);
      items.push({
        id: `welfare-${w.id}`,
        kind: "welfare_updated",
        at: w.changed_at,
        dogId: w.dog_id,
        dogSlug: slug,
        dogName: name,
        actorId: w.changed_by,
        actorName: null,
        title: "Welfare updated",
        detail: `${fromL} → ${toL}${w.note ? ` — ${w.note.slice(0, 120)}${w.note.length > 120 ? "…" : ""}` : ""}`,
        href: `/dogs/${slug}#welfare`,
      });
    }
  }

  const welfareNear = (dogId: string, updatedAtMs: number): boolean => {
    for (const w of welfareInRange) {
      if (w.dog_id !== dogId) continue;
      const t = new Date(w.changed_at).getTime();
      if (Number.isFinite(t) && Math.abs(t - updatedAtMs) <= WELFARE_DEDUPE_MS) return true;
    }
    return false;
  };

  if (wants("dog_profile_updated", k)) {
    for (const d of dogRows) {
      const created = new Date(d.created_at).getTime();
      const updated = new Date(d.updated_at).getTime();
      if (!Number.isFinite(created) || !Number.isFinite(updated)) continue;
      if (updated - created < PROFILE_EDIT_MIN_MS) continue;
      if (updated < new Date(fromIso).getTime() || updated > new Date(toIso).getTime()) continue;
      if (welfareNear(d.id, updated)) continue;
      items.push({
        id: `profile-${d.id}-${d.updated_at}`,
        kind: "dog_profile_updated",
        at: d.updated_at,
        dogId: d.id,
        dogSlug: d.slug,
        dogName: d.name,
        actorId: null,
        actorName: null,
        title: "Dog profile updated",
        detail: d.name,
        href: `/manage/dogs/${d.slug}/edit`,
      });
    }
  }

  if (wants("feeding_logged", k)) {
    const { data, error } = await supabase
      .from("feeding_records")
      .select("id, dog_id, fed_at, notes, fed_by")
      .gte("fed_at", fromIso)
      .lte("fed_at", toIso)
      .order("fed_at", { ascending: false })
      .limit(1500);

    if (error) {
      console.error("[activity feed] feeding_records", error.message);
    } else {
      const rows = (data ?? []) as {
        id: string;
        dog_id: string;
        fed_at: string;
        notes: string | null;
        fed_by: string;
      }[];
      const dogIds = [...new Set(rows.map((r) => r.dog_id))];
      const slugMap = new Map<string, { slug: string; name: string }>();
      if (dogIds.length > 0) {
        const { data: dogs } = await supabase
          .from("dogs")
          .select("id, slug, name")
          .in("id", dogIds);
        for (const d of dogs ?? []) {
          slugMap.set(d.id, { slug: d.slug, name: d.name });
        }
      }
      for (const r of rows) {
        const meta = slugMap.get(r.dog_id);
        if (!meta) continue;
        const note = r.notes?.trim();
        items.push({
          id: `feed-${r.id}`,
          kind: "feeding_logged",
          at: r.fed_at,
          dogId: r.dog_id,
          dogSlug: meta.slug,
          dogName: meta.name,
          actorId: r.fed_by,
          actorName: null,
          title: "Feeding logged",
          detail: note
            ? note.length > 140
              ? `${note.slice(0, 140)}…`
              : note
            : null,
          href: `/dogs/${meta.slug}#feeding`,
        });
      }
    }
  }

  type MedRow = {
    id: string;
    dog_id: string;
    created_at: string;
    event_type: string;
    recorded_by: string;
    description: string | null;
    /** Frozen at insert; activity "added" uses this so notes don’t mirror later edits. */
    description_snapshot?: string | null;
    updated_at?: string | null;
  };

  if (wants("medical_added", k) || wants("medical_updated", k)) {
    let createdRows: MedRow[] = [];
    let updatedRows: MedRow[] = [];

    const sel =
      "id, dog_id, created_at, event_type, recorded_by, description, description_snapshot";
    const selU =
      "id, dog_id, created_at, updated_at, event_type, recorded_by, description, description_snapshot";

    const { data: medCreated, error: eC } = await supabase
      .from("medical_records")
      .select(sel)
      .gte("created_at", fromIso)
      .lte("created_at", toIso)
      .order("created_at", { ascending: false })
      .limit(1500);
    if (eC) console.error("[activity feed] medical created", eC.message);
    else createdRows = (medCreated ?? []) as MedRow[];

    const { data: medUpdated, error: eU } = await supabase
      .from("medical_records")
      .select(selU)
      .gte("updated_at", fromIso)
      .lte("updated_at", toIso)
      .not("updated_at", "is", null)
      .order("updated_at", { ascending: false })
      .limit(1500);

    if (eU) {
      if (eU.message.toLowerCase().includes("updated_at")) {
        updatedRows = [];
      } else {
        console.error("[activity feed] medical updated", eU.message);
      }
    } else {
      updatedRows = (medUpdated ?? []) as MedRow[];
    }

    const dogIds = new Set<string>();
    for (const r of createdRows) dogIds.add(r.dog_id);
    for (const r of updatedRows) dogIds.add(r.dog_id);
    const slugMap = new Map<string, { slug: string; name: string }>();
    if (dogIds.size > 0) {
      const { data: dogs } = await supabase
        .from("dogs")
        .select("id, slug, name")
        .in("id", [...dogIds]);
      for (const d of dogs ?? []) {
        slugMap.set(d.id, { slug: d.slug, name: d.name });
      }
    }

    if (wants("medical_added", k)) {
      for (const r of createdRows) {
        const meta = slugMap.get(r.dog_id);
        if (!meta) continue;
        items.push({
          id: `med-add-${r.id}`,
          kind: "medical_added",
          at: r.created_at,
          dogId: r.dog_id,
          dogSlug: meta.slug,
          dogName: meta.name,
          actorId: r.recorded_by,
          actorName: null,
          title: "Medical record added",
          detail: medicalDetailSnippet(
            r.event_type,
            r.description_snapshot ?? r.description,
          ),
          href: `/dogs/${meta.slug}#medical`,
        });
      }
    }

    if (wants("medical_updated", k)) {
      for (const r of updatedRows) {
        const u = r.updated_at ? new Date(r.updated_at).getTime() : NaN;
        const c = new Date(r.created_at).getTime();
        if (!Number.isFinite(u) || u <= c + 1_000) continue;
        if (u < new Date(fromIso).getTime() || u > new Date(toIso).getTime()) continue;
        const meta = slugMap.get(r.dog_id);
        if (!meta) continue;
        items.push({
          id: `med-upd-${r.id}`,
          kind: "medical_updated",
          at: r.updated_at!,
          dogId: r.dog_id,
          dogSlug: meta.slug,
          dogName: meta.name,
          actorId: r.recorded_by,
          actorName: null,
          title: "Medical record updated",
          detail: medicalDetailSnippet(r.event_type, r.description),
          href: `/dogs/${meta.slug}#medical`,
        });
      }
    }
  }

  const actorIds = [...new Set(items.map((i) => i.actorId).filter((id): id is string => Boolean(id)))];
  const names = await recorderNameMap(supabase, actorIds);
  for (const it of items) {
    if (it.actorId) {
      it.actorName = names.get(it.actorId) ?? "—";
    }
  }

  items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  const max = 250;
  const truncated = items.length > max;
  return { items: items.slice(0, max), truncated };
}
