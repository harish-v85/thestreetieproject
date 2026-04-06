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

  const template = resolveDogProfileTemplate(sp);
  if (template === "v2") {
    return <DogProfileV2 data={data} />;
  }
  return <DogProfileClassic data={data} />;
}
