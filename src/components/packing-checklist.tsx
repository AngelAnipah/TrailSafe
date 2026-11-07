"use client";

import { useState } from "react";

const items = ["Water", "Food", "Hiking boots", "Extra layers", "Headlamp", "First-aid kit", "Navigation device"];

export function PackingChecklist() {
  const [packed, setPacked] = useState<string[]>([]);
  function toggle(item: string) { setPacked((current) => current.includes(item) ? current.filter((entry) => entry !== item) : [...current, item]); }
  return <section aria-labelledby="packing-heading" className="rounded-3xl border border-[#dfe7dd] bg-white p-5 shadow-sm sm:p-6"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a4613c]">Before you go</p><h2 id="packing-heading" className="mt-1 text-2xl font-bold tracking-tight text-[#173d32]">Packing checklist</h2></div><p className="text-sm font-semibold text-[#527366]">{packed.length}/{items.length} packed</p></div><div className="mt-5 grid gap-2 sm:grid-cols-2">{items.map((item) => { const checked = packed.includes(item); return <label key={item} className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-3 text-sm font-semibold transition ${checked ? "border-[#9bc7a5] bg-[#edf7ef] text-[#285b40]" : "border-[#e2e8e0] text-[#4e6d60] hover:border-[#aac5b0]"}`}><input type="checkbox" checked={checked} onChange={() => toggle(item)} className="h-4 w-4 accent-[#287149]" />{item}</label>; })}</div></section>;
}
