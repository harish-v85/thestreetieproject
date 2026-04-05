import Link from "next/link";
import { HeaderHelpPanel } from "@/components/header-help-panel";
import { HeaderNavGroups } from "@/components/header-nav-groups";
import { HeaderUserMenu } from "@/components/header-user-menu";
import { SiteHeaderMobileBar } from "@/components/site-header-mobile-bar";
import { TspSiteLogo } from "@/components/tsp-brand-logo";
import { createClient } from "@/lib/supabase/server";

function AuthLinks({ variant }: { variant: "mobile" | "desktop" }) {
  const isMobile = variant === "mobile";
  const linkMuted = isMobile
    ? "whitespace-nowrap text-xs font-medium text-[var(--muted)] hover:text-[var(--foreground)]"
    : "font-medium text-[var(--muted)] hover:text-[var(--foreground)]";
  const linkAccent = isMobile
    ? "whitespace-nowrap rounded-lg bg-[var(--accent)] px-2.5 py-1.5 text-xs font-medium text-white transition hover:opacity-90"
    : "rounded-lg bg-[var(--accent)] px-3 py-1.5 font-medium text-white transition hover:opacity-90";

  return (
    <>
      <Link href="/request-access" className={linkMuted}>
        {isMobile ? "Access" : "Request access"}
      </Link>
      <Link href="/login" className={linkAccent}>
        Sign in
      </Link>
    </>
  );
}

function SignedInActions({
  helpVariant,
  profile,
  user,
  roleLabel,
}: {
  helpVariant: "dog_feeder" | "admin" | null;
  profile: { full_name: string } | null;
  user: { email?: string | null };
  roleLabel: string | null;
}) {
  const displayName = (profile?.full_name ?? "").trim() || user.email || "Account";
  return (
    <>
      {helpVariant ? <HeaderHelpPanel variant={helpVariant} /> : null}
      <HeaderUserMenu displayName={displayName} email={user.email ?? ""} roleLabel={roleLabel} />
    </>
  );
}

export async function SiteHeader() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: { full_name: string; role: string; status: string } | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("full_name, role, status")
      .eq("id", user.id)
      .maybeSingle();
    profile = data;
  }

  const roleLabel =
    profile?.role === "super_admin"
      ? "Super Admin"
      : profile?.role === "admin"
        ? "Admin"
        : profile?.role === "dog_feeder"
          ? "Dog Feeder"
          : null;

  const canManage =
    profile?.role === "admin" || profile?.role === "super_admin";
  const isSuperAdmin = profile?.role === "super_admin";
  const isActiveStaff =
    profile?.status === "active" &&
    (profile?.role === "dog_feeder" ||
      profile?.role === "admin" ||
      profile?.role === "super_admin");

  const helpVariant =
    profile?.status === "active"
      ? profile.role === "dog_feeder"
        ? ("dog_feeder" as const)
        : profile.role === "admin"
          ? ("admin" as const)
          : null
      : null;

  const navProps = {
    canManage,
    isSuperAdmin,
    isActiveStaff: Boolean(isActiveStaff),
  };

  return (
    <header className="border-b border-black/5 bg-white/80 backdrop-blur-sm">
      <div className="mx-auto w-full max-w-6xl px-4 py-3 sm:px-6 sm:py-4">
        {/* Mobile: hamburger | centered logo | account */}
        <SiteHeaderMobileBar
          navProps={navProps}
          authSlot={
            user ? (
              <SignedInActions
                helpVariant={helpVariant}
                profile={profile}
                user={user}
                roleLabel={roleLabel}
              />
            ) : (
              <AuthLinks variant="mobile" />
            )
          }
        />

        {/* Desktop / tablet: single row */}
        <div className="hidden items-center justify-between gap-6 sm:flex">
          <div className="flex min-w-0 flex-1 items-center gap-6">
            <TspSiteLogo />
            <HeaderNavGroups {...navProps} />
          </div>
          <nav className="flex shrink-0 items-center gap-2 text-sm sm:gap-3">
            {user ? (
              <SignedInActions
                helpVariant={helpVariant}
                profile={profile}
                user={user}
                roleLabel={roleLabel}
              />
            ) : (
              <AuthLinks variant="desktop" />
            )}
          </nav>
        </div>
      </div>
    </header>
  );
}
