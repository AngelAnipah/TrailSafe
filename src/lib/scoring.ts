import type { Trail } from "../types/trail";

export type SafetyCategory = "Go" | "Caution" | "Avoid" | "Unavailable" | "Unknown";
export type SafetyFactorName = "weather" | "avalanche" | "daylight" | "difficulty";
export type SafetyWarning = { code: string; message: string; severity: "advisory" | "critical"; source: string; verifiedAt: string };
export type FactorBreakdown = Record<SafetyFactorName, number | null>;
export type ScoringInputs = {
  weather: number | null; avalanche: number | null; daylight: number | null; difficulty: number | null;
  avalancheApplicable?: boolean; warnings?: SafetyWarning[]; blockingWarnings?: string[];
};
export type ScoringResult = { score: number | null; category: SafetyCategory; breakdown: FactorBreakdown; weights: Record<SafetyFactorName, number>; reasons: string[]; warnings: SafetyWarning[] };

const fullWeights: Record<SafetyFactorName, number> = { weather: 0.4, avalanche: 0.3, daylight: 0.2, difficulty: 0.1 };

/**
 * Applies TrailSafe's 40/30/20/10 model. For a route declared not applicable
 * to avalanche conditions, the 70% non-avalanche share is normalized to 100%
 * (weather 57.14%, daylight 28.57%, difficulty 14.29%). Missing applicable
 * safety data always produces Unavailable; it is never treated as low risk.
 */
export function calculateSafetyScore(inputs: ScoringInputs): ScoringResult {
  const breakdown: FactorBreakdown = { weather: inputs.weather, avalanche: inputs.avalanche, daylight: inputs.daylight, difficulty: inputs.difficulty };
  const avalancheApplicable = inputs.avalancheApplicable ?? true;
  const weights = avalancheApplicable ? fullWeights : { weather: 4 / 7, avalanche: 0, daylight: 2 / 7, difficulty: 1 / 7 };
  const warnings = [
    ...(inputs.warnings ?? []),
    ...(inputs.blockingWarnings ?? []).map((message): SafetyWarning => ({ code: "legacy-blocking-warning", message, severity: "critical", source: "Caller", verifiedAt: new Date(0).toISOString() })),
  ];
  const requiredFactors: SafetyFactorName[] = avalancheApplicable ? ["weather", "avalanche", "daylight", "difficulty"] : ["weather", "daylight", "difficulty"];
  const invalid = requiredFactors.some((factor) => {
    const value = breakdown[factor];
    return value === null || !Number.isFinite(value) || value < 0 || value > 100;
  });
  if (invalid) return { score: null, category: "Unavailable", breakdown, weights, reasons: ["Required safety information is missing, stale, or invalid."], warnings };

  const score = Math.round(requiredFactors.reduce((total, factor) => total + breakdown[factor]! * weights[factor], 0));
  const criticalWarnings = warnings.filter((warning) => warning.severity === "critical");
  const category: SafetyCategory = criticalWarnings.length > 0 ? "Avoid" : score >= 85 ? "Go" : score >= 60 ? "Caution" : "Avoid";
  return {
    score, category, breakdown, weights, warnings,
    reasons: [
      ...requiredFactors.map((factor) => `${factor[0].toUpperCase()}${factor.slice(1)} factor: ${breakdown[factor]}/100`),
      ...(!avalancheApplicable ? ["Avalanche conditions are not applicable for this route; remaining factors are reweighted."] : []),
      ...criticalWarnings.map((warning) => warning.message),
    ],
  };
}

export function calculateDifficultyScore(trail: Pick<Trail, "difficulty" | "distanceMiles" | "elevationGainFeet">): number {
  const base = { Easy: 100, Moderate: 80, Hard: 60, Strenuous: 40 }[trail.difficulty];
  const distancePenalty = Math.max(0, trail.distanceMiles - 3) * 2;
  const elevationPenalty = Math.max(0, trail.elevationGainFeet - 500) / 125;
  return Math.max(0, Math.min(100, Math.round(base - distancePenalty - elevationPenalty)));
}
