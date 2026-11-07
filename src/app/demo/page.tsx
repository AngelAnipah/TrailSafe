import Link from "next/link";
import { AvalancheSummary } from "@/components/avalanche-summary";
import { DemoDataBanner } from "@/components/demo-data-banner";
import { Navbar } from "@/components/navbar";
import { SafetyBadge } from "@/components/safety-badge";
import { SafetyBreakdown } from "@/components/safety-breakdown";
import { WeatherOutlook } from "@/components/weather-outlook";
import { trails } from "@/data/trails";
import { getDemoAssessments } from "@/lib/demo-assessments";

export default function DemoPage() {
  const assessments = getDemoAssessments();
  return <div className="min-h-screen bg-[#f7f5ef]"><Navbar /><DemoDataBanner assessment={assessments[0]} /><main className="mx-auto max-w-7xl px-5 pb-16 pt-10 sm:px-8 lg:px-10"><div className="rounded-[2rem] border border-[#e7c6b8] bg-[#fff8f4] p-6 shadow-sm sm:p-9"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#a4613c]">Screenshot showcase</p><h1 className="mt-2 text-4xl font-bold tracking-tight text-[#173d32] sm:text-5xl">TrailSafe UT demo scenarios</h1><p className="mt-4 max-w-3xl leading-7 text-[#5c685f]">These deterministic scenarios demonstrate the safety breakdown, weather outlook, avalanche panel, daylight calculations, and unavailable state. They are illustrative only and never replace live conditions.</p><Link href="/" className="mt-6 inline-flex rounded-full bg-[#1e5a45] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#174a39]">Return to live trail conditions</Link></div><div className="mt-10 space-y-10">{assessments.map((assessment) => { const trail = trails.find((entry) => entry.id === assessment.trailId)!; return <section key={assessment.trailId} className="scroll-mt-6"><div className="flex flex-wrap items-end justify-between gap-4 border-b border-[#d9e3d7] pb-4"><div><p className="text-sm font-bold uppercase tracking-[0.16em] text-[#a4613c]">Demo scenario</p><h2 className="mt-1 text-3xl font-bold tracking-tight text-[#173d32]">{trail.name}</h2><p className="mt-1 text-sm text-[#60786d]">{trail.location} · {trail.duration}</p></div><div className="flex items-center gap-3"><p className="text-3xl font-extrabold text-[#1d5b44]">{assessment.score ?? "—"}</p><SafetyBadge category={assessment.category} /></div></div><div className="mt-6 grid gap-6 lg:grid-cols-[1.35fr_.65fr]"><div className="space-y-6"><SafetyBreakdown assessment={assessment} /><WeatherOutlook assessment={assessment} /></div><AvalancheSummary assessment={assessment} /></div></section>; })}</div></main></div>;
}
