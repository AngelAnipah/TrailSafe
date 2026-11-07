const factors = [
  { title: "Weather", weight: "40%", score: 34, detail: "Mild temperatures and limited precipitation", tone: "bg-[#e6f3e8] text-[#246445]" },
  { title: "Avalanche danger", weight: "30%", score: 23, detail: "Review current avalanche bulletin before departure", tone: "bg-[#fff4da] text-[#936717]" },
  { title: "Daylight", weight: "20%", score: 17, detail: "Plan to finish with daylight remaining", tone: "bg-[#edf3e8] text-[#396852]" },
  { title: "Trail difficulty", weight: "10%", score: 8, detail: "Terrain and elevation affect the overall score", tone: "bg-[#f5ebe4] text-[#9a583a]" },
];

export function SafetyBreakdown() {
  return <section aria-labelledby="safety-breakdown-heading"><div className="flex items-end justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-[0.16em] text-[#a4613c]">Demo data</p><h2 id="safety-breakdown-heading" className="mt-1 text-2xl font-bold tracking-tight text-[#173d32]">Safety score breakdown</h2></div><p className="text-xs text-[#71867c]">Weighted factors</p></div><div className="mt-5 grid gap-3 sm:grid-cols-2">{factors.map((factor) => <article key={factor.title} className="rounded-2xl border border-[#e0e7dd] bg-white p-4 shadow-sm"><div className="flex items-start justify-between gap-3"><div><h3 className="font-bold text-[#224638]">{factor.title}</h3><p className="mt-1 text-xs text-[#6d8379]">{factor.detail}</p></div><span className={`rounded-full px-2 py-1 text-xs font-bold ${factor.tone}`}>{factor.weight}</span></div><div className="mt-4 flex items-center gap-3"><div className="h-2 flex-1 overflow-hidden rounded-full bg-[#edf1e9]"><div className="h-full rounded-full bg-[#4d926c]" style={{ width: `${(factor.score / Number(factor.weight.slice(0, -1))) * 100}%` }} /></div><span className="text-sm font-extrabold text-[#1d5b44]">{factor.score}/{factor.weight.slice(0, -1)}</span></div></article>)}</div></section>;
}
