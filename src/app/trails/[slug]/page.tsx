import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { Navbar } from "@/components/navbar";
import { PackingChecklist } from "@/components/packing-checklist";
import { SafetyBadge } from "@/components/safety-badge";
import { SafetyBreakdown } from "@/components/safety-breakdown";
import { WeatherOutlook } from "@/components/weather-outlook";
import { trails } from "@/data/trails";
import { createUnavailableAssessment } from "@/lib/assessment-fallback";
import { getTrailSafetyAssessment, type TrailSafetyAssessment } from "@/lib/safety-assessment";

type TrailParams = Promise<{ slug: string }>;

export async function generateStaticParams() {
  return trails.map((trail) => ({ slug: trail.id }));
}

export default function TrailDetailPage({ params }: { params: TrailParams }) {
  return (
    <div className="min-h-screen bg-[#f7f5ef]">
      <Navbar />
      <main>
        <div className="mx-auto max-w-7xl px-5 pt-7 sm:px-8 lg:px-10">
          <Link href="/#trails" className="inline-flex items-center gap-2 rounded-lg px-1 py-2 text-sm font-bold text-[#31604d] transition hover:text-[#174a39] focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#73a98c]">
            <span aria-hidden="true">←</span> Back to Trails
          </Link>
        </div>
        <Suspense fallback={<TrailDetailLoading />}>
          <TrailDetailContent params={params} />
        </Suspense>
      </main>
    </div>
  );
}

async function TrailDetailContent({ params }: { params: TrailParams }) {
  const { slug } = await params;
  const trail = trails.find((entry) => entry.id === slug);

  if (!trail) notFound();

  await connection();
  const requestedAt = new Date().toISOString();
  let assessment: TrailSafetyAssessment;
  try {
    assessment = await getTrailSafetyAssessment(trail, requestedAt);
  } catch {
    assessment = createUnavailableAssessment(trail, "A live safety assessment could not be generated.", requestedAt);
  }

  return (
    <>
      <section className="mx-auto max-w-7xl px-5 pb-10 pt-4 sm:px-8 lg:px-10">
        <div className="grid overflow-hidden rounded-[2rem] border border-[#dce6d9] bg-white shadow-[0_16px_45px_rgba(29,75,56,0.11)] lg:grid-cols-[1.1fr_.9fr]">
          <div className="relative min-h-[300px] lg:min-h-[500px]">
            <Image src={trail.image} alt={trail.imageAlt} fill priority sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
            <p className="absolute bottom-6 left-6 text-sm font-semibold text-white/90">{trail.location}</p>
          </div>
          <div className="flex flex-col justify-center p-6 sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a4613c]">Trail condition overview</p>
            <h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-[#173d32] sm:text-5xl">{trail.name}</h1>
            <p className="mt-3 text-[#60786d]">{trail.location} · Live provider data is informational, not a guarantee of safety.</p>
            <div className="mt-7 flex items-center gap-4">
              <div className="grid h-24 w-24 place-items-center rounded-3xl bg-[#e7f3e8] text-center"><span className="text-4xl font-extrabold leading-none text-[#1d5b44]">{assessment.score ?? "—"}</span><span className="text-[10px] font-bold uppercase tracking-wider text-[#537b68]">{assessment.score === null ? "unavailable" : "of 100"}</span></div>
              <div><SafetyBadge category={assessment.category} /><p className="mt-2 text-sm font-semibold text-[#294a3e]">{assessment.category === "Unavailable" ? "Live assessment unavailable" : `${assessment.category} recommendation`}</p><p className="text-xs text-[#71867c]">Updated {new Intl.DateTimeFormat("en-US", { hour: "numeric", minute: "2-digit", timeZone: "America/Denver", timeZoneName: "short" }).format(new Date(assessment.generatedAt))}</p></div>
            </div>
            <p className="mt-6 border-l-4 border-[#a8cfae] pl-4 text-sm leading-6 text-[#49675a]">{assessment.score === null ? assessment.unavailableReasons[0] ?? "Live safety information is unavailable." : assessment.scoring.reasons[0] ?? "Live safety data is available for this trail."}</p>
            <div className="mt-7"><Link href={`/trails/${trail.id}/hike`} className="inline-flex w-full justify-center rounded-xl bg-[#1e5a45] px-5 py-3.5 text-sm font-bold text-white transition hover:bg-[#174a39] focus-visible:outline-4 focus-visible:outline-offset-4 focus-visible:outline-[#73a98c] sm:w-auto">Start Hike</Link><p className="mt-2 text-xs text-[#71867c]">Set a return time and choose a demo emergency contact check-in.</p></div>
          </div>
        </div>
      </section>
      <section className="mx-auto grid max-w-7xl gap-6 px-5 pb-16 sm:px-8 lg:grid-cols-[1.35fr_.65fr] lg:px-10">
        <div className="space-y-6">
          <section className="rounded-3xl border border-[#dfe7dd] bg-white p-5 shadow-sm sm:p-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a4613c]">Trail details</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-[#173d32]">Plan your route</h2><dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4"><DetailFact label="Distance" value={`${trail.distanceMiles} mi`} /><DetailFact label="Elevation" value={`${trail.elevationGainFeet.toLocaleString()} ft`} /><DetailFact label="Difficulty" value={trail.difficulty} /><DetailFact label="Duration" value={trail.duration} /></dl></section>
          <SafetyBreakdown assessment={assessment} />
          <WeatherOutlook assessment={assessment} />
          <AvalancheSummary assessment={assessment} />
        </div>
        <aside><PackingChecklist /></aside>
      </section>
    </>
  );
}

function AvalancheSummary({ assessment }: { assessment: TrailSafetyAssessment }) {
  const avalanche = assessment.avalanche;
  return <section className="rounded-3xl border border-[#dfe7dd] bg-white p-5 shadow-sm sm:p-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a4613c]">Live avalanche data</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-[#173d32]">Avalanche conditions</h2>{!avalanche ? <p className="mt-4 text-sm text-slate-600">Avalanche conditions are unavailable. Do not assume low risk.</p> : !avalanche.applicable ? <p className="mt-4 text-sm text-[#587166]">Avalanche conditions are not applicable for this route. The assessment reweights the remaining safety factors.</p> : avalanche.available ? <div className="mt-4"><p className="text-lg font-bold text-[#24483a]">{avalanche.danger} danger</p><p className="mt-1 text-sm text-[#587166]">Issued {avalanche.issuedAt ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short", timeZone: "America/Denver" }).format(new Date(avalanche.issuedAt)) : "—"}</p>{avalanche.sourceUrl && <a className="mt-3 inline-flex text-sm font-bold text-[#1e5a45] underline underline-offset-4" href={avalanche.sourceUrl} target="_blank" rel="noreferrer">View Utah Avalanche Center forecast</a>}</div> : <p className="mt-4 text-sm text-slate-600">{avalanche.reason ?? "Avalanche conditions are unavailable. Do not assume low risk."}</p>}</section>;
}

function DetailFact({ label, value }: { label: string; value: string }) {
  return <div className="rounded-2xl bg-[#f4f7f1] p-3"><dt className="text-xs text-[#70877c]">{label}</dt><dd className="mt-1 font-bold text-[#24483a]">{value}</dd></div>;
}

function TrailDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl animate-pulse px-5 pb-16 pt-4 sm:px-8 lg:px-10" aria-label="Loading trail details" role="status">
      <div className="grid overflow-hidden rounded-[2rem] border border-[#dce6d9] bg-white shadow-[0_16px_45px_rgba(29,75,56,0.08)] lg:grid-cols-[1.1fr_.9fr]"><div className="min-h-[300px] bg-[#dfe9dd] lg:min-h-[500px]" /><div className="space-y-5 p-6 sm:p-10"><div className="h-3 w-36 rounded-full bg-[#dce8da]" /><div className="h-12 w-4/5 rounded-xl bg-[#e6ede3]" /><div className="h-5 w-1/2 rounded-full bg-[#edf1ea]" /><div className="flex items-center gap-4"><div className="h-24 w-24 rounded-3xl bg-[#dfeee1]" /><div className="space-y-2"><div className="h-6 w-24 rounded-full bg-[#e6ede3]" /><div className="h-4 w-32 rounded-full bg-[#edf1ea]" /></div></div><div className="h-14 w-full rounded-xl bg-[#edf1ea]" /></div></div>
      <div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_.65fr]"><div className="space-y-6"><div className="h-48 rounded-3xl border border-[#e0e8de] bg-white" /><div className="h-72 rounded-3xl border border-[#e0e8de] bg-white" /></div><div className="h-96 rounded-3xl border border-[#e0e8de] bg-white" /></div>
      <span className="sr-only">Loading trail safety details…</span>
    </div>
  );
}
