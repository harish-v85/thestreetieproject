import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { buildBulkDogTemplateBuffer } from "@/lib/dogs/bulk-dog-template";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, status")
    .eq("id", user.id)
    .maybeSingle();

  if (
    !profile ||
    profile.status !== "active" ||
    profile.role !== "super_admin"
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const [{ data: localityRows }, { data: neighbourhoodRows }] = await Promise.all([
    supabase
      .from("localities")
      .select("name")
      .eq("approval_status", "approved")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
    supabase
      .from("neighbourhoods")
      .select("name")
      .eq("approval_status", "approved")
      .order("sort_order", { ascending: true })
      .order("name", { ascending: true }),
  ]);

  const localityNames = [...new Set((localityRows ?? []).map((r) => r.name.trim()).filter(Boolean))];
  const neighbourhoodNames = [
    ...new Set((neighbourhoodRows ?? []).map((r) => r.name.trim()).filter(Boolean)),
  ];

  const buffer = await buildBulkDogTemplateBuffer({ localityNames, neighbourhoodNames });

  return new NextResponse(new Uint8Array(buffer), {
    status: 200,
    headers: {
      "Content-Type":
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="streetie-bulk-dogs-template.xlsx"',
      "Cache-Control": "private, no-store",
    },
  });
}
