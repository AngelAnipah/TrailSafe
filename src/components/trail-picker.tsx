"use client";

import { useMemo, useState } from "react";
import { SearchBar } from "@/components/search-bar";
import { SafetyFilters, type SafetyFilter } from "@/components/safety-filters";
import { TrailCard } from "@/components/trail-card";
import { trails } from "@/data/trails";
import { getSafetyStatus } from "@/types/trail";

export function TrailPicker() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<SafetyFilter>("All");
  const visibleTrails = useMemo(() => trails.filter((trail) => {
    const matchesQuery = `${trail.name} ${trail.location}`.toLowerCase().includes(query.trim().toLowerCase());
    return matchesQuery && (filter === "All" || getSafetyStatus(trail.safetyScore) === filter);
  }), [filter, query]);

  return <section id="trails" className="scroll-mt-24 mx-auto max-w-7xl px-5 pb-20 pt-12 sm:px-8 lg:px-10 lg:pt-16"><div className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between"><div><p className="text-sm font-bold uppercase tracking-[0.18em] text-[#a4613c]">Today&apos;s trail conditions</p><h2 className="mt-2 text-3xl font-bold tracking-tight text-[#173d32] sm:text-4xl">Find your next safe adventure.</h2><p className="mt-3 max-w-xl text-[#597168]">Safety scores shown below are demo data while TrailSafe connects live weather and route conditions.</p></div><div className="w-full lg:max-w-xl"><SearchBar value={query} onChange={setQuery} /></div></div><div className="mt-7 flex flex-col gap-4 border-b border-[#dfe6dd] pb-6 sm:flex-row sm:items-center sm:justify-between"><SafetyFilters activeFilter={filter} onChange={setFilter} /><p className="text-sm font-medium text-[#6d8379]">{visibleTrails.length} {visibleTrails.length === 1 ? "trail" : "trails"} found</p></div>{visibleTrails.length ? <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{visibleTrails.map((trail, index) => <TrailCard key={trail.id} trail={trail} priority={index < 2} />)}</div> : <div className="mt-8 rounded-3xl border border-dashed border-[#c9d7c9] bg-white/60 px-6 py-16 text-center"><p className="text-lg font-bold text-[#294a3e]">No trails match that search.</p><p className="mt-2 text-sm text-[#668075]">Try another trail, park, or safety filter.</p></div>}</section>;
}
