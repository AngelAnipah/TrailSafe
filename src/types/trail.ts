export type SafetyStatus = "Go" | "Caution" | "Avoid";

export type AvalancheRegion =
  | "salt-lake"
  | "provo"
  | "uintas"
  | "not-applicable";

/** A source record kept beside the trailhead coordinate used for weather lookups. */
export type CoordinateReference = {
  sourceName: string;
  sourceUrl: string;
  verifiedAt: string;
};

export type Trail = {
  id: string;
  name: string;
  location: string;
  image: string;
  imageAlt: string;
  distanceMiles: number;
  elevationGainFeet: number;
  latitude?: number;
  longitude?: number;
  coordinateReference?: CoordinateReference;
  difficulty: "Easy" | "Moderate" | "Hard" | "Strenuous";
  /** Existing display value. Kept until frontend migration is complete. */
  duration: string;
  /** Typical round-trip hiking time used by the safety assessment. */
  estimatedDurationMinutes: number;
  /** UAC region, or a deliberate declaration that avalanche scoring does not apply. */
  avalancheRegion: AvalancheRegion;
  /** Requires a separately verified check before an assessment can be issued. */
  requiredConditionChecks?: Array<"flash-flood" | "river-condition">;
  /** Compatibility-only demo fields. Live data is returned by getTrailSafetyAssessment. */
  safetyScore: number;
  safetyRationale: string;
};

/** Kept separate from API integration for an easy handoff to live scoring data. */
export function getSafetyStatus(score: number): SafetyStatus {
  if (score >= 85) return "Go";
  if (score >= 60) return "Caution";
  return "Avoid";
}
