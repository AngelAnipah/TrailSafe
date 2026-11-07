import type { Trail } from "@/types/trail";
import type { TrailSafetyAssessment } from "@/lib/safety-assessment";

/** Represents an unexpected server-side assessment failure without implying safety. */
export function createUnavailableAssessment(trail: Trail, reason: string, generatedAt: string): TrailSafetyAssessment {
  const avalancheApplicable = trail.avalancheRegion !== "not-applicable";

  return {
    dataMode: "live", trailId: trail.id, plannedStartTime: generatedAt, generatedAt, category: "Unavailable", score: null,
    scoring: { score: null, category: "Unavailable", breakdown: { weather: null, avalanche: null, daylight: null, difficulty: null }, weights: avalancheApplicable ? { weather: 0.4, avalanche: 0.3, daylight: 0.2, difficulty: 0.1 } : { weather: 4 / 7, avalanche: 0, daylight: 2 / 7, difficulty: 1 / 7 }, reasons: [reason], warnings: [] },
    weather: null, avalanche: null, daylight: null, requiredConditionChecks: [], unavailableReasons: [reason],
  };
}
