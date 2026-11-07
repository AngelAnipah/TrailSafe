import assert from "node:assert/strict";
import test from "node:test";
import { getAvalancheConditions } from "../src/lib/avalanche.ts";
import { calculateDaylightScore } from "../src/lib/daylight.ts";
import { getTrailSafetyAssessment } from "../src/lib/safety-assessment.ts";
import { calculateDifficultyScore, calculateSafetyScore } from "../src/lib/scoring.ts";
import { calculateWeatherScore, getTrailWeather } from "../src/lib/weather.ts";
import { feetToMeters } from "../src/lib/weather.ts";
import { getDemoAssessments } from "../src/lib/demo-assessments.ts";
import type { Trail } from "../src/types/trail.ts";

const trail: Trail = {
  id: "test-trail", name: "Test Trail", location: "Utah", image: "", imageAlt: "", distanceMiles: 3,
  elevationGainFeet: 500, latitude: 40, longitude: -111, difficulty: "Moderate", duration: "2 hr",
  estimatedDurationMinutes: 120, avalancheRegion: "salt-lake", safetyScore: 0, safetyRationale: "",
};
const now = new Date("2026-01-15T16:00:00.000Z");
const planned = new Date("2026-01-15T17:00:00.000Z");

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json" } });
}

function weatherResponse(): Response {
  const hour = Math.floor(planned.getTime() / 3_600_000);
  return jsonResponse({
    current: { time: hour * 3600, temperature_2m: 55, apparent_temperature: 53, precipitation_probability: 10, precipitation: 0, weather_code: 1, wind_speed_10m: 8, wind_gusts_10m: 12, visibility: 10000 },
    hourly: { time: [(hour - 1) * 3600, hour * 3600], temperature_2m: [54, 55], apparent_temperature: [52, 53], precipitation_probability: [10, 10], precipitation: [0, 0], weather_code: [1, 1], wind_speed_10m: [8, 8], wind_gusts_10m: [12, 12], visibility: [10000, 10000] },
    daily: { time: [hour * 3600], sunrise: [hour * 3600 - 21_600], sunset: [hour * 3600 + 21_600] },
  });
}

function uacResponse(): Response {
  return jsonResponse([{ overall_danger_rose: [2, 2, 2], date_issued: "2026-01-15T12:00:00.000Z", expires: "2026-01-16T12:00:00.000Z" }]);
}

test("uses all four TrailSafe weights and category boundaries", () => {
  assert.equal(calculateSafetyScore({ weather: 85, avalanche: 85, daylight: 85, difficulty: 85 }).category, "Go");
  assert.equal(calculateSafetyScore({ weather: 60, avalanche: 60, daylight: 60, difficulty: 60 }).category, "Caution");
  assert.equal(calculateSafetyScore({ weather: 59, avalanche: 59, daylight: 59, difficulty: 59 }).category, "Avoid");
  assert.equal(calculateSafetyScore({ weather: 100, avalanche: null, daylight: 100, difficulty: 100 }).category, "Unavailable");
});

test("reweights only explicitly non-applicable avalanche conditions", () => {
  const result = calculateSafetyScore({ weather: 100, avalanche: null, daylight: 100, difficulty: 100, avalancheApplicable: false });
  assert.equal(result.score, 100);
  assert.equal(result.weights.avalanche, 0);
});

test("critical verified warnings override the score", () => {
  const result = calculateSafetyScore({ weather: 100, avalanche: 100, daylight: 100, difficulty: 100, warnings: [{ code: "test", message: "Critical", severity: "critical", source: "test", verifiedAt: now.toISOString() }] });
  assert.equal(result.category, "Avoid");
});

test("daylight score boundaries use real timestamps", () => {
  assert.equal(calculateDaylightScore(planned, 60, planned.getTime() + 3 * 3_600_000).score, 100);
  assert.equal(calculateDaylightScore(planned, 60, planned.getTime() + 2 * 3_600_000).score, 85);
  assert.equal(calculateDaylightScore(planned, 60, planned.getTime() + 30 * 60_000).score, 0);
});

test("weather chooses the hourly forecast matching the planned hour", async () => {
  const weather = await getTrailWeather(trail, planned, { now, fetcher: async () => weatherResponse() });
  assert.equal(weather.forecastAtPlannedStart.time, planned.getTime());
  assert.equal(weather.sunset, planned.getTime() + 21_600_000);
});

test("weather provider failures and absent planned hours fail safely", async () => {
  await assert.rejects(() => getTrailWeather(trail, planned, { fetcher: async () => new Response("down", { status: 503 }) }));
  const missingHour = jsonResponse({ current: { time: 1, temperature_2m: 1, apparent_temperature: 1, precipitation_probability: 1, precipitation: 1, weather_code: 1, wind_speed_10m: 1, wind_gusts_10m: 1, visibility: 1 }, hourly: { time: [1], temperature_2m: [1], apparent_temperature: [1], precipitation_probability: [1], precipitation: [1], weather_code: [1], wind_speed_10m: [1], wind_gusts_10m: [1], visibility: [1] }, daily: { time: [1], sunrise: [1], sunset: [1] } });
  await assert.rejects(() => getTrailWeather(trail, planned, { fetcher: async () => missingHour }));
});

test("weather hazards produce a critical warning", () => {
  const result = calculateWeatherScore({ time: planned.getTime(), temperatureF: 50, apparentTemperatureF: 50, windSpeedMph: 30, windGustsMph: 60, precipitationProbability: 10, precipitationInches: 0, weatherCode: 1, visibilityMeters: 10000 }, now.toISOString());
  assert.equal(result.warnings[0]?.severity, "critical");
});

test("converts Open-Meteo visibility from feet and keeps metre thresholds", () => {
  assert.equal(feetToMeters(0), 0);
  assert.ok(Math.abs(feetToMeters(16_404.199475) - 5_000) < 0.001);
  const conditions = (visibilityMeters: number) => ({ time: planned.getTime(), temperatureF: 60, apparentTemperatureF: 60, windSpeedMph: 10, windGustsMph: 10, precipitationProbability: 0, precipitationInches: 0, weatherCode: 1, visibilityMeters });
  assert.equal(calculateWeatherScore(conditions(5_000), now.toISOString()).score, 100);
  assert.equal(calculateWeatherScore(conditions(1_000), now.toISOString()).score, 94);
  assert.equal(calculateWeatherScore(conditions(999), now.toISOString()).score, 88);
});

test("UAC provider rejects expired and malformed current ratings", async () => {
  const expired = await getAvalancheConditions(trail, { now, fetcher: async () => jsonResponse([{ overall_danger_rose: [6], date_issued: "2026-01-14", expires: "2026-01-15T00:00:00.000Z" }]) });
  assert.equal(expired.available, false);
  const failed = await getAvalancheConditions(trail, { now, fetcher: async () => new Response("unavailable", { status: 503 }) });
  assert.equal(failed.available, false);
});

test("UAC authorization failures keep a user-safe unavailable explanation", async () => {
  const result = await getAvalancheConditions(trail, { now, fetcher: async () => new Response("unauthorized", { status: 401 }) });
  assert.equal(result.available, false);
  assert.equal(result.reason, "Avalanche advisory unavailable — authorized data access required.");
  assert.equal(result.reason?.includes("401"), false);
});

test("assessment returns live result when providers are valid", async () => {
  const assessment = await getTrailSafetyAssessment(trail, planned, {
    now,
    weather: { fetcher: async () => weatherResponse() },
    avalanche: { fetcher: async () => uacResponse() },
  });
  assert.equal(assessment.category, "Go");
  assert.equal(assessment.score, 96);
  assert.equal(assessment.dataMode, "live");
});

test("Narrows assessment requires fresh flood and river checks", async () => {
  const narrows: Trail = { ...trail, id: "the-narrows", avalancheRegion: "not-applicable", requiredConditionChecks: ["flash-flood", "river-condition"] };
  const assessment = await getTrailSafetyAssessment(narrows, planned, { now, weather: { fetcher: async () => weatherResponse() } });
  assert.equal(assessment.category, "Unavailable");
  assert.equal(assessment.unavailableReasons.length, 2);
});

test("assessment becomes unavailable when an applicable avalanche forecast is missing", async () => {
  const assessment = await getTrailSafetyAssessment(trail, planned, { now, weather: { fetcher: async () => weatherResponse() }, avalanche: { fetcher: async () => new Response("down", { status: 503 }) } });
  assert.equal(assessment.category, "Unavailable");
  assert.equal(assessment.score, null);
  assert.equal(assessment.dataMode, "live");
});

test("demo assessments are explicit, separate fixtures with coherent categories", () => {
  const assessments = getDemoAssessments();
  assert.deepEqual(assessments.map((assessment) => [assessment.category, assessment.score]), [["Go", 98], ["Caution", 71], ["Avoid", 35], ["Unavailable", null]]);
  assert.ok(assessments.every((assessment) => assessment.dataMode === "demo"));
  assert.equal(assessments.some((assessment) => assessment.dataMode === "live"), false);
});

test("difficulty is deterministic and rewards less demanding routes", () => {
  assert.ok(calculateDifficultyScore({ ...trail, difficulty: "Easy", distanceMiles: 1, elevationGainFeet: 100 }) > calculateDifficultyScore({ ...trail, difficulty: "Strenuous", distanceMiles: 12, elevationGainFeet: 4000 }));
});
