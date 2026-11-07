import type { SafetyCategory } from "@/lib/scoring";

const styles: Record<SafetyCategory, string> = {
  Go: "border-emerald-200 bg-emerald-50 text-emerald-800",
  Caution: "border-amber-200 bg-amber-50 text-amber-800",
  Avoid: "border-red-200 bg-red-50 text-red-800",
  Unavailable: "border-slate-200 bg-slate-100 text-slate-700",
  Unknown: "border-sky-200 bg-sky-50 text-sky-800",
};

const dots: Record<SafetyCategory, string> = { Go: "bg-emerald-500", Caution: "bg-amber-500", Avoid: "bg-red-500", Unavailable: "bg-slate-500", Unknown: "bg-sky-500" };

export function SafetyBadge({ category }: { category: SafetyCategory }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${styles[category]}`}><span className={`h-1.5 w-1.5 rounded-full ${dots[category]}`} />{category}</span>;
}
