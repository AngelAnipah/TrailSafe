import type { TrailSafetyAssessment } from "@/lib/safety-assessment";

export function DemoDataBanner({ assessment }: { assessment?: TrailSafetyAssessment }) {
  if (assessment?.dataMode !== "demo") return null;
  return <div role="status" className="border-y-2 border-[#9d492a] bg-[#fff0e8] px-5 py-3 text-center text-sm font-extrabold tracking-[0.08em] text-[#7b331e] sm:px-8">DEMO DATA — NOT LIVE CONDITIONS</div>;
}
