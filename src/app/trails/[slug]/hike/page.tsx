import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { SafetyFlow } from "@/components/safety-flow";
import { trails } from "@/data/trails";
import { createUnavailableAssessment } from "@/lib/assessment-fallback";
import { getTrailSafetyAssessment, type TrailSafetyAssessment } from "@/lib/safety-assessment";

type TrailParams = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return trails.map((trail) => ({ slug: trail.id }));
}

export default function HikePage({ params }: { params: TrailParams }) {
  return <Suspense fallback={<HikeLoading />}><HikeContent params={params} /></Suspense>;
}

async function HikeContent({ params }: { params: TrailParams }) {
  const { slug } = await params;
  const trail = trails.find((entry) => entry.id === slug);
  if (!trail) notFound();
  await connection();
  const requestedAt = new Date().toISOString();
  let assessment: TrailSafetyAssessment;
  try { assessment = await getTrailSafetyAssessment(trail, requestedAt); }
  catch { assessment = createUnavailableAssessment(trail, "A live safety assessment could not be generated.", requestedAt); }
  return <SafetyFlow trail={trail} assessment={assessment} />;
}

function HikeLoading() {
  return <main className="min-h-screen bg-[#f7f5ef] px-5 py-8 sm:px-8"><div className="mx-auto max-w-2xl animate-pulse"><Link href="/#trails" className="text-sm font-bold text-[#31604d]">← Back to Trails</Link><div className="mt-5 overflow-hidden rounded-[2rem] border border-[#dfe7dd] bg-white shadow-sm"><div className="h-48 bg-[#dfe9dd]" /><div className="space-y-4 p-6"><div className="h-8 w-2/3 rounded-full bg-[#e6ede3]" /><div className="h-20 rounded-2xl bg-[#edf1ea]" /><div className="h-44 rounded-2xl bg-[#f2f5f0]" /></div></div></div></main>;
}
