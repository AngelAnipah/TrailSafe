import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { PackingChecklist } from "@/components/packing-checklist";
import { SafetyBadge } from "@/components/safety-badge";
import { SafetyBreakdown } from "@/components/safety-breakdown";
import { WeatherOutlook } from "@/components/weather-outlook";
import { trails } from "@/data/trails";
import { getSafetyStatus } from "@/types/trail";

export async function generateStaticParams() {
  return trails.map((trail) => ({ slug: trail.id }));
}

export default async function TrailDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const trail = trails.find((entry) => entry.id === slug);
  if (!trail) notFound();

  const status = getSafetyStatus(trail.safetyScore);
  const longHike = trail.duration.startsWith("8") || trail.duration.startsWith("5");

  return <div className="min-h-screen bg-[#f7f5ef]"><Navbar /><main><div className="mx-auto max-w-7xl px-5 pt-7 sm:px-8 lg:px-10"><Link href="/" className="inline-flex items-center gap-2 rounded-lg px-1 py-2 text-sm font-bold text-[#31604d] transition hover:text-[#174a39] focus-visible:outline-4 focus-visible:outline-offset-2 focus-visible:outline-[#73a98c]"><span aria-hidden="true">←</span> Back to Trails</Link></div><section className="mx-auto max-w-7xl px-5 pb-10 pt-4 sm:px-8 lg:px-10"><div className="grid overflow-hidden rounded-[2rem] border border-[#dce6d9] bg-white shadow-[0_16px_45px_rgba(29,75,56,0.11)] lg:grid-cols-[1.1fr_.9fr]"><div className="relative min-h-[300px] lg:min-h-[500px]"><Image src={trail.image} alt={trail.imageAlt} fill priority sizes="(max-width: 1024px) 100vw, 55vw" className="object-cover" /><div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" /><p className="absolute bottom-6 left-6 text-sm font-semibold text-white/90">{trail.location}</p></div><div className="flex flex-col justify-center p-6 sm:p-10"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a4613c]">Trail condition overview</p><h1 className="mt-3 text-4xl font-bold leading-tight tracking-tight text-[#173d32] sm:text-5xl">{trail.name}</h1><p className="mt-3 text-[#60786d]">{trail.location} · Safety information is currently demo data.</p><div className="mt-7 flex items-center gap-4"><div className="grid h-24 w-24 place-items-center rounded-3xl bg-[#e7f3e8] text-center"><span className="text-4xl font-extrabold leading-none text-[#1d5b44]">{trail.safetyScore}</span><span className="text-[10px] font-bold uppercase tracking-wider text-[#537b68]">of 100</span></div><div><SafetyBadge score={trail.safetyScore} /><p className="mt-2 text-sm font-semibold text-[#294a3e]">{status} recommendation</p><p className="text-xs text-[#71867c]">Sample safety score</p></div></div><p className="mt-6 border-l-4 border-[#a8cfae] pl-4 text-sm leading-6 text-[#49675a]">{trail.safetyRationale}</p><div className="mt-7"><button type="button" disabled title="Check-in integration pending" className="w-full cursor-not-allowed rounded-xl bg-[#8aaa9a] px-5 py-3.5 text-sm font-bold text-white opacity-80 sm:w-auto">Start Hike</button><p className="mt-2 text-xs text-[#71867c]">Check-in integration pending — this button will connect to your team&apos;s check-in flow.</p></div></div></div></section><section className="mx-auto grid max-w-7xl gap-6 px-5 pb-16 sm:px-8 lg:grid-cols-[1.35fr_.65fr] lg:px-10"><div className="space-y-6"><section className="rounded-3xl border border-[#dfe7dd] bg-white p-5 shadow-sm sm:p-6"><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a4613c]">Trail details</p><h2 className="mt-1 text-2xl font-bold tracking-tight text-[#173d32]">Plan your route</h2><dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4"><div className="rounded-2xl bg-[#f4f7f1] p-3"><dt className="text-xs text-[#70877c]">Distance</dt><dd className="mt-1 font-bold text-[#24483a]">{trail.distanceMiles} mi</dd></div><div className="rounded-2xl bg-[#f4f7f1] p-3"><dt className="text-xs text-[#70877c]">Elevation</dt><dd className="mt-1 font-bold text-[#24483a]">{trail.elevationGainFeet.toLocaleString()} ft</dd></div><div className="rounded-2xl bg-[#f4f7f1] p-3"><dt className="text-xs text-[#70877c]">Difficulty</dt><dd className="mt-1 font-bold text-[#24483a]">{trail.difficulty}</dd></div><div className="rounded-2xl bg-[#f4f7f1] p-3"><dt className="text-xs text-[#70877c]">Duration</dt><dd className="mt-1 font-bold text-[#24483a]">{trail.duration}</dd></div></dl></section><SafetyBreakdown /><WeatherOutlook longHike={longHike} /></div><aside><PackingChecklist /></aside></section></main></div>;
}
