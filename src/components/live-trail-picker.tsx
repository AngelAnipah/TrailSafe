import { TrailPicker } from "@/components/trail-picker";
import { connection } from "next/server";
import { trails } from "@/data/trails";
import { createUnavailableAssessment } from "@/lib/assessment-fallback";
import { getTrailSafetyAssessment, type TrailSafetyAssessment } from "@/lib/safety-assessment";

export async function LiveTrailPicker() {
  await connection();
  const plannedStartTime = new Date().toISOString();
  const results = await Promise.all(trails.map(async (trail) => {
    try { return await getTrailSafetyAssessment(trail, plannedStartTime); }
    catch { return createUnavailableAssessment(trail, "A live safety assessment could not be generated.", plannedStartTime); }
  }));
  const assessments: Record<string, TrailSafetyAssessment> = Object.fromEntries(results.map((assessment) => [assessment.trailId, assessment]));
  return <TrailPicker assessments={assessments} />;
}

export function TrailPickerLoading() {
  return <section id="trails" className="scroll-mt-24 mx-auto max-w-7xl px-5 pb-20 pt-12 sm:px-8 lg:px-10 lg:pt-16" aria-label="Loading live trail conditions" role="status"><div className="animate-pulse"><div className="h-4 w-44 rounded-full bg-[#eadccd]" /><div className="mt-3 h-10 w-80 max-w-full rounded-xl bg-[#dfe9dd]" /><div className="mt-4 h-5 w-full max-w-xl rounded-full bg-[#e8eee4]" /><div className="mt-8 h-10 w-72 rounded-full bg-[#e6ece3]" /><div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{Array.from({ length: 8 }, (_, index) => <div key={index} className="overflow-hidden rounded-3xl border border-[#e0e6de] bg-white"><div className="aspect-[16/10] bg-[#dce6d9]" /><div className="space-y-3 p-5"><div className="h-6 w-3/4 rounded-full bg-[#e6ede3]" /><div className="h-16 rounded-xl bg-[#f0f3ed]" /></div></div>)}</div></div><span className="sr-only">Loading live safety assessments…</span></section>;
}
