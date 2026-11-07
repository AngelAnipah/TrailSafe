import type { Trail } from "../types/trail";
import { getAvalancheConditions, type AvalancheConditions, type AvalancheOptions } from "./avalanche.ts";
import { calculateDaylightScore, type DaylightResult } from "./daylight.ts";
import { calculateDifficultyScore, calculateSafetyScore, type SafetyCategory, type SafetyWarning, type ScoringResult } from "./scoring.ts";
import { calculateWeatherScore, getTrailWeather, type TrailWeather, type WeatherOptions } from "./weather.ts";

export type RequiredConditionCheck = {
  type: "flash-flood" | "river-condition";
  status: "safe" | "critical" | "unavailable";
  source: string;
  sourceUrl: string;
  verifiedAt: string;
  message?: string;
};

export type TrailSafetyAssessmentOptions = {
  now?: Date;
  weather?: WeatherOptions;
  avalanche?: AvalancheOptions;
  conditionChecks?: RequiredConditionCheck[];
  /** A weather reading older than this cannot produce a safety recommendation. */
  maxWeatherAgeMinutes?: number;
  warnings?: SafetyWarning[];
};

export type TrailSafetyAssessment = {
  /** Live provider data and separately activated screenshot fixtures never share a mode. */
  dataMode: "live" | "demo";
  trailId: string;
  plannedStartTime: string;
  generatedAt: string;
  category: SafetyCategory;
  score: number | null;
  scoring: ScoringResult;
  weather: TrailWeather | null;
  avalanche: AvalancheConditions | null;
  daylight: DaylightResult | null;
  requiredConditionChecks: RequiredConditionCheck[];
  unavailableReasons: string[];
};

function isFresh(timestamp: string, now: Date, maxAgeMinutes: number): boolean {
  const time = new Date(timestamp).getTime();
  return Number.isFinite(time) && time <= now.getTime() && now.getTime() - time <= maxAgeMinutes * 60_000;
}

function checkWarnings(trail: Trail, checks: RequiredConditionCheck[], now: Date): { warnings: SafetyWarning[]; unavailable: string[] } {
  const warnings: SafetyWarning[] = [];
  const unavailable: string[] = [];
  for (const required of trail.requiredConditionChecks ?? []) {
    const check = checks.find((entry) => entry.type === required);
    if (!check || check.status === "unavailable" || !isFresh(check.verifiedAt, now, 60)) {
      unavailable.push(`Current ${required === "flash-flood" ? "flash-flood" : "river-condition"} check is required before this assessment can be issued.`);
      continue;
    }
    if (check.status === "critical") warnings.push({ code: required, message: check.message ?? `${required} check reports critical conditions.`, severity: "critical", source: check.source, verifiedAt: check.verifiedAt });
  }
  return { warnings, unavailable };
}

/**
 * The data-layer entry point for frontend integration. It does not render UI.
 * It returns Unavailable when any required provider or Narrows check is absent/stale.
 */
export async function getTrailSafetyAssessment(trail: Trail, plannedStartTime: string | Date, options: TrailSafetyAssessmentOptions = {}): Promise<TrailSafetyAssessment> {
  const now = options.now ?? new Date();
  const planned = new Date(plannedStartTime);
  if (!Number.isFinite(planned.getTime())) throw new Error("Invalid planned start time");
  const [weatherResult, avalancheResult] = await Promise.allSettled([
    getTrailWeather(trail, planned, { ...options.weather, now }),
    getAvalancheConditions(trail, { ...options.avalanche, now }),
  ]);
  const weather = weatherResult.status === "fulfilled" ? weatherResult.value : null;
  const avalanche = avalancheResult.status === "fulfilled" ? avalancheResult.value : null;
  const unavailableReasons: string[] = [];
  if (!weather) unavailableReasons.push("Live weather is unavailable.");
  if (weather && !isFresh(weather.retrievedAt, now, options.maxWeatherAgeMinutes ?? 60)) unavailableReasons.push("Live weather data is stale.");
  if (trail.avalancheRegion !== "not-applicable" && (!avalanche || !avalanche.available)) unavailableReasons.push(avalanche?.reason ?? "Live avalanche data is unavailable.");

  const checkResult = checkWarnings(trail, options.conditionChecks ?? [], now);
  unavailableReasons.push(...checkResult.unavailable);
  const daylight = weather ? calculateDaylightScore(planned, trail.estimatedDurationMinutes, weather.sunset) : null;
  const weatherScore = weather ? calculateWeatherScore(weather.forecastAtPlannedStart, weather.retrievedAt) : null;
  const warnings = [...(options.warnings ?? []), ...(weatherScore?.warnings ?? []), ...(avalanche?.warnings ?? []), ...checkResult.warnings];
  const scoring = calculateSafetyScore({
    weather: unavailableReasons.length === 0 ? weatherScore?.score ?? null : null,
    avalanche: avalanche?.score ?? null,
    daylight: unavailableReasons.length === 0 ? daylight?.score ?? null : null,
    difficulty: unavailableReasons.length === 0 ? calculateDifficultyScore(trail) : null,
    avalancheApplicable: trail.avalancheRegion !== "not-applicable",
    warnings,
  });
  return {
    dataMode: "live", trailId: trail.id, plannedStartTime: planned.toISOString(), generatedAt: now.toISOString(),
    category: unavailableReasons.length ? "Unavailable" : scoring.category,
    score: unavailableReasons.length ? null : scoring.score,
    scoring: unavailableReasons.length ? { ...scoring, category: "Unavailable", score: null, reasons: [...unavailableReasons, ...scoring.reasons] } : scoring,
    weather, avalanche, daylight, requiredConditionChecks: options.conditionChecks ?? [], unavailableReasons,
  };
}
