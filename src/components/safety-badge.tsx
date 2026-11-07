import { getSafetyStatus, type SafetyStatus } from "@/types/trail";

const styles: Record<SafetyStatus, string> = {
  Go: "border-emerald-200 bg-emerald-50 text-emerald-800",
  Caution: "border-amber-200 bg-amber-50 text-amber-800",
  Avoid: "border-red-200 bg-red-50 text-red-800",
};

export function SafetyBadge({ score }: { score: number }) {
  const status = getSafetyStatus(score);
  const dot = status === "Go" ? "bg-emerald-500" : status === "Caution" ? "bg-amber-500" : "bg-red-500";

  return <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${styles[status]}`}><span className={`h-1.5 w-1.5 rounded-full ${dot}`} />{status}</span>;
}
