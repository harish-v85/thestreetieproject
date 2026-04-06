import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { requireSuperAdmin } from "@/lib/auth/require-super-admin";
import { defaultPasswordFromFirstName } from "@/lib/users/default-password-from-name";
import { resolveLocalityIdFromPrefill } from "@/lib/users/resolve-locality-prefill";
import { UserNewForm } from "../user-new-form";

export const metadata: Metadata = {
  title: "Add user — Streetie",
};

export const dynamic = "force-dynamic";

function firstString(
  sp: Record<string, string | string[] | undefined>,
  key: string,
): string | undefined {
  const v = sp[key];
  if (typeof v === "string") return v;
  if (Array.isArray(v) && typeof v[0] === "string") return v[0];
  return undefined;
}

export default async function NewUserPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireSuperAdmin();
  const supabase = await createClient();
  const { data: localities } = await supabase
    .from("localities")
    .select("id, name, slug")
    .order("sort_order", { ascending: true });

  const sp = await searchParams;
  const fromAccess = firstString(sp, "from") === "access";
  const email = firstString(sp, "email")?.trim();
  const fullName = firstString(sp, "full_name")?.trim();
  const phone = firstString(sp, "phone")?.trim();
  const localityName = firstString(sp, "locality_name")?.trim();
  const intendedRole = firstString(sp, "intended_role");

  const locRows = (localities ?? []) as { id: string; name: string; slug: string }[];

  const prefill =
    fromAccess && email && fullName
      ? {
          email,
          full_name: fullName,
          phone: phone || null,
          role: intendedRole === "admin" ? ("admin" as const) : ("dog_feeder" as const),
          locality_id: resolveLocalityIdFromPrefill(localityName, locRows),
          defaultPassword: defaultPasswordFromFirstName(fullName),
        }
      : null;

  return (
    <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-12">
      <nav className="mb-8 text-sm">
        <Link href="/manage/users" className="font-medium text-[var(--accent)]">
          ← Users
        </Link>
      </nav>
      <h1 className="text-2xl font-semibold tracking-tight text-[var(--foreground)]">
        Add user
      </h1>
      <p className="mt-2 text-sm text-[var(--muted)]">
        Creates an Auth user and profile. They can sign in immediately if status is{" "}
        <strong>Active</strong>.
      </p>
      {prefill ? (
        <p className="mt-3 rounded-lg border border-emerald-200/80 bg-emerald-50/90 px-3 py-2 text-sm text-emerald-950">
          Prefilled from an approved access request. Review the fields, then create the user.
        </p>
      ) : null}
      <div className="mt-8 rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
        <UserNewForm
          key={prefill ? `prefill-${prefill.email}` : "new-user-empty"}
          localities={locRows}
          prefill={prefill}
        />
      </div>
    </main>
  );
}
