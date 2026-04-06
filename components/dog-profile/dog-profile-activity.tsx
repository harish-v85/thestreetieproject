import { CollapsibleLogFeeding } from "@/components/collapsible-log-feeding";
import { SuperAdminFeedingRecordActions } from "@/components/super-admin-feeding-record-actions";
import { SuperAdminMedicalRecordActions } from "@/components/super-admin-medical-record-actions";
import { FeedingLocationLink } from "@/components/feeding-location-link";
import type { DogProfileData } from "@/lib/dogs/load-dog-profile-data";
import { formatDogProfileRecordDate } from "@/lib/dogs/dog-profile-dates";

const eventLabel: Record<string, string> = {
  vaccination: "Vaccination",
  neutering: "Neutering",
  vet_visit: "Vet visit",
  other: "Other",
};

type ActivityVariant = "classic" | "v2";

export function DogProfileMedicalSection({
  data,
  variant = "classic",
}: {
  data: DogProfileData;
  variant?: ActivityVariant;
}) {
  const { dog, medical, recorderNames, superAdminViewer, upcomingMedical, todayStr } = data;
  const scroll = data.scrollMedicalList;
  const listWrap =
    variant === "v2"
      ? ""
      : scroll
        ? "max-h-[min(28rem,50vh)] overflow-y-auto [scrollbar-gutter:stable] pr-1"
        : "";

  const titleClass =
    variant === "v2"
      ? "text-sm font-semibold uppercase tracking-wide text-[var(--foreground)] sm:text-[0.95rem]"
      : "text-sm font-semibold uppercase tracking-wide text-[var(--muted)]";

  return (
    <section className={variant === "v2" ? "mb-0" : "mb-10"}>
      <h2 className={titleClass}>Medical records</h2>
      <p
        className={
          variant === "v2"
            ? "mt-1.5 text-xs text-[var(--muted)]"
            : "mt-2 text-sm text-[var(--muted)]"
        }
      >
        A record of care — vaccinations, treatments, and visits logged by the community.
        {superAdminViewer
          ? " As super admin, you can edit or remove individual records below."
          : null}
      </p>
      {upcomingMedical.length > 0 ? (
        <div
          className={
            variant === "v2"
              ? "mt-3 rounded-xl border border-amber-200/80 bg-amber-50/90 px-3 py-2.5 text-xs text-amber-950"
              : "mt-4 rounded-xl border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-950"
          }
          role="status"
        >
          <p className="font-medium">Upcoming follow-ups</p>
          <ul className="mt-2 list-inside list-disc space-y-1 text-amber-900/95">
            {upcomingMedical.map((m) => (
              <li key={m.id}>
                <span className="font-medium">{eventLabel[m.event_type] ?? m.event_type}</span>
                {" — next due "}
                <time dateTime={m.next_due_date!}>
                  {formatDogProfileRecordDate(m.next_due_date!)}
                </time>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className={listWrap ? `mt-3 ${listWrap}` : variant === "v2" ? "mt-3" : "mt-4"}>
        <ul className="space-y-3">
          {medical.length > 0 ? (
            medical.map((m) => (
              <li
                key={m.id}
                className="rounded-xl border border-black/5 bg-white px-4 py-3 shadow-sm"
              >
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="font-medium text-[var(--foreground)]">
                    {eventLabel[m.event_type] ?? m.event_type}
                  </span>
                  <time className="text-sm text-[var(--muted)]" dateTime={m.occurred_on}>
                    {formatDogProfileRecordDate(m.occurred_on)}
                  </time>
                </div>
                {m.description ? (
                  <p className="mt-2 text-sm text-[var(--foreground)]">{m.description}</p>
                ) : null}
                {m.next_due_date ? (
                  <p
                    className={
                      m.next_due_date < todayStr
                        ? "mt-2 text-sm font-medium text-red-800"
                        : "mt-2 text-sm text-[var(--muted)]"
                    }
                  >
                    Next due:{" "}
                    <time dateTime={m.next_due_date}>
                      {formatDogProfileRecordDate(m.next_due_date)}
                    </time>
                    {m.next_due_date < todayStr ? " (overdue)" : null}
                  </p>
                ) : null}
                <p className="mt-2 text-xs text-[var(--muted)]">
                  Recorded by {recorderNames.get(m.recorded_by) ?? "—"}
                </p>
                {superAdminViewer ? (
                  <SuperAdminMedicalRecordActions
                    row={{
                      id: m.id,
                      event_type: m.event_type,
                      occurred_on: m.occurred_on,
                      description: m.description,
                      next_due_date: m.next_due_date,
                    }}
                    dogId={dog.id}
                    dogSlug={dog.slug}
                    returnTo="profile"
                  />
                ) : null}
              </li>
            ))
          ) : (
            <li className="rounded-xl border border-black/5 bg-[var(--background)]/40 px-4 py-6 text-center shadow-sm">
              <p className="text-sm font-medium text-[var(--foreground)]">No medical records yet</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                Nothing has been logged so far.
              </p>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}

export function DogProfileFeedingSection({
  data,
  variant = "classic",
}: {
  data: DogProfileData;
  variant?: ActivityVariant;
}) {
  const { dog, feedings, recorderNames, staffViewer, superAdminViewer } = data;
  const scroll = data.scrollFeedingList;
  const listWrap =
    variant === "v2"
      ? ""
      : scroll
        ? "max-h-[min(28rem,50vh)] overflow-y-auto [scrollbar-gutter:stable] pr-1"
        : "";

  const titleClass =
    variant === "v2"
      ? "text-sm font-semibold uppercase tracking-wide text-[var(--foreground)] sm:text-[0.95rem]"
      : "text-sm font-semibold uppercase tracking-wide text-[var(--muted)]";

  return (
    <section
      id="feeding"
      className={
        variant === "v2"
          ? "scroll-mt-8 mt-8 border-t border-black/10 pt-8"
          : "mb-10 scroll-mt-8"
      }
    >
      <h2 className={titleClass}>Feeding log</h2>
      <p
        className={
          variant === "v2"
            ? "mt-1.5 text-xs text-amber-900/80"
            : "mt-2 text-sm text-amber-900/80"
        }
      >
        This is not a complete record of everything the dog has been fed. It reflects only what
        volunteers have logged.
        {superAdminViewer
          ? " As super admin, you can edit or remove individual entries below."
          : null}
      </p>
      {staffViewer ? (
        <div className={variant === "v2" ? "mt-3" : "mt-2"}>
          <CollapsibleLogFeeding dogId={dog.id} dogSlug={dog.slug} />
        </div>
      ) : null}
      <div className={listWrap ? `mt-3 ${listWrap}` : variant === "v2" ? "mt-3" : "mt-4"}>
        <ul className="space-y-3">
          {feedings.length > 0 ? (
            feedings.map((f) => {
              const hasLocation =
                f.lat != null &&
                f.lng != null &&
                Number.isFinite(f.lat) &&
                Number.isFinite(f.lng);
              const feederName = recorderNames.get(f.fed_by) ?? "—";
              const notesTrimmed = f.notes?.trim() ?? "";
              return (
                <li
                  key={f.id}
                  className="rounded-xl border border-black/5 bg-white px-4 py-3 shadow-sm"
                >
                  <time
                    className="block text-base font-semibold tracking-tight text-[var(--foreground)]"
                    dateTime={f.fed_at}
                  >
                    {new Date(f.fed_at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </time>
                  <p className="mt-2 text-sm leading-snug text-[var(--foreground)]">
                    {notesTrimmed ? (
                      notesTrimmed
                    ) : (
                      <span className="italic text-[var(--muted)]">No feeding notes</span>
                    )}
                  </p>
                  <p className="mt-2 flex flex-wrap items-center gap-x-1 gap-y-0.5 text-xs text-[var(--muted)]">
                    <span>
                      fed by{" "}
                      <span className="font-medium text-[var(--foreground)]">{feederName}</span>
                    </span>
                    {hasLocation ? (
                      <>
                        <span aria-hidden>at</span>
                        <FeedingLocationLink
                          inline
                          lat={f.lat!}
                          lng={f.lng!}
                          popupLabel={`${dog.name} — feeding`}
                        />
                      </>
                    ) : null}
                  </p>
                  {superAdminViewer ? (
                    <SuperAdminFeedingRecordActions
                      row={{
                        id: f.id,
                        fed_at: f.fed_at,
                        notes: f.notes,
                        lat: f.lat,
                        lng: f.lng,
                      }}
                      dogId={dog.id}
                      dogSlug={dog.slug}
                    />
                  ) : null}
                </li>
              );
            })
          ) : (
            <li className="rounded-xl border border-black/5 bg-[var(--background)]/40 px-4 py-6 text-center shadow-sm">
              <p className="text-sm font-medium text-[var(--foreground)]">No feeding logs yet.</p>
              <p className="mt-1 text-xs text-[var(--muted)]">
                No entries have been recorded so far.
              </p>
            </li>
          )}
        </ul>
      </div>
    </section>
  );
}
