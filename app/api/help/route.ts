import { readFile } from "fs/promises";
import path from "path";
import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

const HELP_DIR = path.join(process.cwd(), "content", "help");

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const variant = searchParams.get("variant");
  if (variant !== "dog_feeder" && variant !== "admin") {
    return NextResponse.json({ error: "Invalid variant" }, { status: 400 });
  }

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

  if (profile?.status !== "active") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  if (variant === "dog_feeder" && profile.role !== "dog_feeder") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (variant === "admin" && profile.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const filename = variant === "admin" ? "admin.md" : "dog-feeder.md";
    const body = await readFile(path.join(HELP_DIR, filename), "utf8");
    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Cache-Control": "private, max-age=60",
      },
    });
  } catch {
    return NextResponse.json({ error: "Help content missing" }, { status: 500 });
  }
}
