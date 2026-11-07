"use client";

import type { SafetyStatus } from "@/types/trail";
export type SafetyFilter = "All" | SafetyStatus;
const filters: SafetyFilter[] = ["All", "Go", "Caution", "Avoid"];

export function SafetyFilters({ activeFilter, onChange }: { activeFilter: SafetyFilter; onChange: (filter: SafetyFilter) => void }) {
  return <div className="flex flex-wrap gap-2" aria-label="Filter trails by safety status">{filters.map((filter) => { const active = filter === activeFilter; return <button key={filter} type="button" onClick={() => onChange(filter)} aria-pressed={active} className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${active ? "border-[#1e5a45] bg-[#1e5a45] text-white shadow-sm" : "border-[#d9e2d7] bg-white text-[#547166] hover:border-[#94b3a3]"}`}>{filter === "All" ? "All conditions" : filter}</button>; })}</div>;
}
