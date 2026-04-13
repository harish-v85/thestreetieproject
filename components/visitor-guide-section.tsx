import Link from "next/link";
import {
  Dog,
  FunnelSimple,
  MagnifyingGlass,
  MapTrifold,
  Question,
} from "@phosphor-icons/react/ssr";
import { MIN_DIRECTORY_SEARCH_CHARS } from "@/lib/dogs/home-directory";

const tipIconClass =
  "mt-0.5 h-5 w-5 shrink-0 text-[var(--accent)] sm:h-[1.125rem] sm:w-[1.125rem]";

export type VisitorGuideStaffHelpRole = "dog_feeder" | "admin";

function staffHelpLabel(role: VisitorGuideStaffHelpRole): string {
  return role === "dog_feeder" ? "Dog Feeder" : "Admin";
}

/** Same roles that see `HeaderHelpPanel` (active dog feeder or admin). */
export function visitorGuideStaffHelpRoleFromProfile(
  profile: { role: string; status: string } | null | undefined,
): VisitorGuideStaffHelpRole | null {
  if (!profile || profile.status !== "active") return null;
  if (profile.role === "dog_feeder") return "dog_feeder";
  if (profile.role === "admin") return "admin";
  return null;
}

/**
 * Basics for browsing the directory: search, filters, profiles, map.
 * Active dog feeders and admins get a pointer to the header help (?) control.
 */
export function VisitorGuideSection({
  signedIn,
  staffHelpRole,
}: {
  signedIn: boolean;
  /** Matches who sees `HeaderHelpPanel` — active dog feeder or admin only. */
  staffHelpRole: VisitorGuideStaffHelpRole | null;
}) {
  const intro = signedIn
    ? "Here are a few basics for browsing dogs in the directory:"
    : "You don't need an account to look around. Here are a few basics:";

  return (
    <section className="mb-8" aria-labelledby="visitor-guide-heading">
      <h2
        id="visitor-guide-heading"
        className="mb-2 text-lg font-semibold text-[var(--foreground)]"
      >
        How to explore
      </h2>
      <p className="mb-6 text-sm text-[var(--muted)]">{intro}</p>

      <div className="rounded-2xl border border-slate-200/90 bg-slate-50/90 px-4 py-4 sm:px-5 sm:py-5">
        <div className="space-y-4 text-sm leading-relaxed">
          <div className="flex gap-3 sm:gap-4">
            <MagnifyingGlass className={tipIconClass} weight="regular" aria-hidden />
            <div>
              <p className="font-medium text-[var(--foreground)]">Search for a dog</p>
              <p className="mt-0.5 text-[var(--muted)]">
                Use the search box above the list. To match names or places, type at least{" "}
                {MIN_DIRECTORY_SEARCH_CHARS} characters—then the list updates as you go.
              </p>
            </div>
          </div>
          <div className="flex gap-3 sm:gap-4">
            <FunnelSimple className={tipIconClass} weight="regular" aria-hidden />
            <div>
              <p className="font-medium text-[var(--foreground)]">Narrow the list</p>
              <p className="mt-0.5 text-[var(--muted)]">
                Use locality, neighbourhood, gender, sterilisation status, or colour to filter.
                <span className="block sm:hidden">
                  {" "}
                  Tap &apos;Show more search filters&apos; to open those options under the search
                  field.
                </span>
              </p>
            </div>
          </div>
          <div className="flex gap-3 sm:gap-4">
            <Dog className={tipIconClass} weight="regular" aria-hidden />
            <div>
              <p className="font-medium text-[var(--foreground)]">View a dog&apos;s profile</p>
              <p className="mt-0.5 text-[var(--muted)]">
                Click any dog&apos;s card. That opens their full profile with more photos, their
                story, and other details.
              </p>
            </div>
          </div>
          <div className="flex gap-3 sm:gap-4">
            <MapTrifold className={tipIconClass} weight="regular" aria-hidden />
            <div>
              <p className="font-medium text-[var(--foreground)]">Browse on a map</p>
              <p className="mt-0.5 text-[var(--muted)]">
                Prefer a map?{" "}
                <Link
                  href="/dogs/map"
                  className="font-medium text-[var(--accent)] underline-offset-2 hover:underline"
                >
                  Open map view
                </Link>{" "}
                to see dogs by area.
              </p>
            </div>
          </div>
        </div>

        {staffHelpRole ? (
          <p className="mt-4 border-t border-slate-200/80 pt-4 text-sm leading-relaxed text-[var(--muted)]">
            To see what else you can do as a {staffHelpLabel(staffHelpRole)}, click the{" "}
            <Question
              className="inline-block h-[1.15em] w-[1.15em] align-[-0.2em] text-[var(--accent)]"
              weight="regular"
              aria-label="Question mark help"
            />{" "}
            icon on the top right of the page.
          </p>
        ) : null}
      </div>
    </section>
  );
}
