import { trails } from "../data/trails.ts";
import { calculateDaylightScore } from "./daylight.ts";
import { calculateSafetyScore, type SafetyCategory } from "./scoring.ts";
import type { AvalancheConditions } from "./avalanche.ts";
import type { TrailSafetyAssessment } from "./safety-assessment.ts";
import { calculateWeatherScore, type TrailWeather, type WeatherConditions } from "./weather.ts";

/**
 * Deterministic, explicitly non-live scenarios used only by the /demo route.
 * They are intentionally not imported by live fetching or fallback code.
 */
export const DEMO_TIMESTAMP = "2026-10-15T15:00:00.000Z";

type DemoScenario = {
  trailId: string;
  weatherScore: number | null;
  avalancheScore: number | null;
  daylightScore: number | null;
  avalancheDanger: AvalancheConditions["danger"];
  expectedCategory: SafetyCategory;
  unavailableReasons?: string[];
};

const scenarios: DemoScenario[] = [
  { trailId: "donut-falls", weatherScore: 100, avalancheScore: 100, daylightScore: 100, avalancheDanger: "Low", expectedCategory: "Go" },
  { trailId: "lake-blanche", weatherScore: 70, avalancheScore: 75, daylightScore: 85, avalancheDanger: "Moderate", expectedCategory: "Caution" },
  { trailId: "mount-timpanogos", weatherScore: 34, avalancheScore: 45, daylightScore: 40, avalancheDanger: "Considerable", expectedCategory: "Avoid" },
  { trailId: "the-narrows", weatherScore: null, avalancheScore: null, daylightScore: null, avalancheDanger: null, expectedCategory: "Unavailable", unavailableReasons: ["Current flash-flood check is required before this assessment can be issued.", "Current river-condition check is required before this assessment can be issued."] },
];

function weatherConditions(offsetHours: number, weatherScore: number | null): WeatherConditions {
  const profile = weatherScore === 34
    ? { temperatureF: 36, apparentTemperatureF: 20, windSpeedMph: 32, windGustsMph: 43, precipitationProbability: 65, precipitationInches: 0.08, weatherCode: 61, visibilityMeters: 800 }
    : weatherScore === 70
      ? { temperatureF: 48, apparentTemperatureF: 43, windSpeedMph: 17, windGustsMph: 27, precipitationProbability: 45, precipitationInches: 0.02, weatherCode: 3, visibilityMeters: 2_000 }
      : { temperatureF: 61, apparentTemperatureF: 61, windSpeedMph: 8, windGustsMph: 14, precipitationProbability: 10, precipitationInches: 0, weatherCode: 1, visibilityMeters: 12_000 };
  return { time: new Date(DEMO_TIMESTAMP).getTime() + offsetHours * 3_600_000, ...profile };
}

function demoWeather(weatherScore: number | null, durationMinutes: number, daylightScore: number | null): TrailWeather {
  const selected = weatherConditions(0, weatherScore);
  const minutesBeforeSunset = daylightScore === 85 ? 90 : daylightScore === 40 ? 10 : 180;
  return {
    temperatureF: selected.temperatureF,
    windSpeedMph: selected.windSpeedMph,
    precipitationProbability: selected.precipitationProbability,
    sunrise: new Date(DEMO_TIMESTAMP).getTime() - 3 * 3_600_000,
    sunset: new Date(DEMO_TIMESTAMP).getTime() + (durationMinutes + minutesBeforeSunset) * 60_000,
    current: selected,
    forecastAtPlannedStart: selected,
    hourlyForecast: Array.from({ length: 6 }, (_, index) => weatherConditions(index, weatherScore)),
    retrievedAt: DEMO_TIMESTAMP,
    provider: "Open-Meteo",
  };
}

function demoAvalanche(trailId: string, danger: AvalancheConditions["danger"], score: number | null): AvalancheConditions {
  const trail = trails.find((entry) => entry.id === trailId)!;
  const applicable = trail.avalancheRegion !== "not-applicable";
  return {
    applicable,
    available: applicable,
    danger,
    score,
    region: trail.avalancheRegion,
    issuedAt: applicable ? DEMO_TIMESTAMP : null,
    expiresAt: applicable ? "2026-10-16T15:00:00.000Z" : null,
    retrievedAt: DEMO_TIMESTAMP,
    sourceUrl: null,
    warnings: [],
    reason: applicable ? undefined : "Avalanche forecast is not applicable to this route.",
  };
}

function createDemoAssessment(scenario: DemoScenario): TrailSafetyAssessment {
  const trail = trails.find((entry) => entry.id === scenario.trailId);
  if (!trail) throw new Error(`Missing demo trail ${scenario.trailId}`);
  const weather = demoWeather(scenario.weatherScore, trail.estimatedDurationMinutes, scenario.daylightScore);
  const daylight = calculateDaylightScore(DEMO_TIMESTAMP, trail.estimatedDurationMinutes, weather.sunset);
  const unavailable = scenario.unavailableReasons ?? [];
  const calculatedWeatherScore = calculateWeatherScore(weather.forecastAtPlannedStart, DEMO_TIMESTAMP).score;
  if (scenario.weatherScore !== null && calculatedWeatherScore !== scenario.weatherScore) throw new Error(`Invalid demo weather scenario for ${scenario.trailId}`);
  if (scenario.daylightScore !== null && daylight.score !== scenario.daylightScore) throw new Error(`Invalid demo daylight scenario for ${scenario.trailId}`);
  const scoring = calculateSafetyScore({
    weather: unavailable.length ? null : calculatedWeatherScore,
    avalanche: unavailable.length ? null : scenario.avalancheScore,
    daylight: unavailable.length ? null : daylight.score,
    difficulty: unavailable.length ? null : Math.max(0, Math.min(100, { "donut-falls": 80, "lake-blanche": 34, "mount-timpanogos": 0, "the-narrows": 68 }[scenario.trailId] ?? 0)),
    avalancheApplicable: trail.avalancheRegion !== "not-applicable",
  });
  if (scoring.category !== scenario.expectedCategory) throw new Error(`Invalid demo scenario for ${scenario.trailId}`);
  return {
    dataMode: "demo",
    trailId: trail.id,
    plannedStartTime: DEMO_TIMESTAMP,
    generatedAt: DEMO_TIMESTAMP,
    category: scoring.category,
    score: scoring.score,
    scoring,
    weather,
    avalanche: demoAvalanche(trail.id, scenario.avalancheDanger, scenario.avalancheScore),
    daylight: scenario.daylightScore === null ? null : daylight,
    requiredConditionChecks: [],
    unavailableReasons: unavailable,
  };
}

/** Deterministic fixtures for screenshots; callers must opt in by importing this module. */
export function getDemoAssessments(): TrailSafetyAssessment[] {
  return scenarios.map(createDemoAssessment);
}

