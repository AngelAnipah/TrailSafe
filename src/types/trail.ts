export type SafetyStatus = "Go" | "Caution" | "Avoid";

export type Trail = {
  id: string;
  name: string;
  location: string;
  image: string;
  imageAlt: string;
  distanceMiles: number;
  elevationGainFeet: number;
  difficulty: "Easy" | "Moderate" | "Hard" | "Strenuous";
  duration: string;
  safetyScore: number;
  safetyRationale: string;
};

/** Kept separate from API integration for an easy handoff to live scoring data. */
export function getSafetyStatus(score: number): SafetyStatus {
  if (score >= 85) return "Go";
  if (score >= 60) return "Caution";
  return "Avoid";
}
