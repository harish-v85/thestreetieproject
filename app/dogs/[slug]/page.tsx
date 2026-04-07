import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DogProfileClassic } from "@/components/dog-profile/dog-profile-classic";
import { DogProfileV2 } from "@/components/dog-profile/dog-profile-v2";
import { loadDogProfileData } from "@/lib/dogs/load-dog-profile-data";
import { resolveDogProfileTemplate } from "@/lib/dogs/dog-profile-template";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const supabase = await createClient();
  const { data } = await supabase
    .from("dogs")
    .select("name")
    .eq("slug", slug)
    .eq("status", "active")
    .maybeSingle();

  if (!data) return { title: "Streetie" };
  return { title: `${data.name} — Streetie` };
}

export default async function DogProfilePage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = await searchParams;
  const data = await loadDogProfileData(slug);
  if (!data) notFound();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  let canEditDogProfile = false;
  if (user) {
    const { data: prof } = await supabase
      .from("profiles")
      .select("role, status")
      .eq("id", user.id)
      .maybeSingle();
    canEditDogProfile =
      prof?.status === "active" &&
      (prof?.role === "admin" || prof?.role === "super_admin");
  }

  const template = resolveDogProfileTemplate(sp);
  if (template === "v2") {
    return <DogProfileV2 data={data} canEditDogProfile={canEditDogProfile} />;
  }
  return <DogProfileClassic data={data} canEditDogProfile={canEditDogProfile} />;
}
