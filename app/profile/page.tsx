import type { Metadata } from "next";
import Link from "next/link";
import { ProfileForm } from "@/app/profile/profile-form";
import { requireSignedIn } from "@/lib/auth/require-signed-in";
import { createClient } from "@/lib/supabase/server";
import type { NeighbourhoodOption } from "@/components/dog-location-fields";

export const metadata: Metadata = {
  title: "My profile",
};

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const { userId, email } = await requireSignedIn("/profile");
  const supabase = await createClient();

  const { data: profile, error: profErr } = await supabase
    .from("profiles")
    .select("full_name, phone, locality_id, neighbourhood_id, role, status")
    .eq("id", userId)
    .maybeSingle();

  if (profErr) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
          {profErr.message}
        </p>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
        <p className="text-[var(--foreground)]">No profile found for this account.</p>
      </main>
    );
  }

  const { data: localities } = await supabase
    .from("localities")
    .select("id, name")
    .order("sort_order", { ascending: true });

  const { data: nbRows } = await supabase
    .from("neighbourhoods")
    .select("id, locality_id, name")
    .order("sort_order", { ascending: true });

  const neighbourhoods: NeighbourhoodOption[] = (nbRows ?? []).map((n) => ({
    id: n.id,
    locality_id: n.locality_id,
    name: n.name,
  }));

  const row = profile as {
    full_name: string;
    phone: string | null;
    locality_id: string | null;
    neighbourhood_id: string | null;
    role: string;
    status: string;
  };

  const displayName = row.full_name.trim() || "there";

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="mb-8 text-sm">
        <Link href="/" className="font-medium text-[var(--accent)]">
          ← Home
        </Link>
      </nav>

      <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">My profile</h1>
      <div className="mt-2 space-y-3 text-sm text-[var(--muted)]">
        <p>
          Hi {displayName}! <br/> You can update your profile information here. 
            <i>  (Role and status are set by administrators.) </i>
        </p>
      </div>

      <div className="mt-8 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <ProfileForm
          email={email ?? "—"}
          profile={{
            full_name: row.full_name,
            phone: row.phone,
            locality_id: row.locality_id,
            neighbourhood_id: row.neighbourhood_id,
            role: row.role,
            status: row.status,
          }}
          localities={localities ?? []}
          neighbourhoods={neighbourhoods}
        />
      </div>
    </main>
  );
}
