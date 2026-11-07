import type { Trail } from "../types/trail";
import type { SafetyWarning } from "./scoring";

export const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";
export const TRAILSAFE_TIME_ZONE = "America/Denver";
const FEET_TO_METERS = 0.3048;

export function feetToMeters(feet: number): number {
  return feet * FEET_TO_METERS;
}

export type WeatherConditions = {
  time: number;
  temperatureF: number;
  apparentTemperatureF: number;
  windSpeedMph: number;
  windGustsMph: number;
  precipitationProbability: number;
  precipitationInches: number;
  weatherCode: number;
  visibilityMeters: number;
};

export type TrailWeather = {
  /** Compatibility aliases for the selected forecast hour. */
  temperatureF: number;
  windSpeedMph: number;
  precipitationProbability: number;
  sunset: number;
  sunrise: number;
  current: WeatherConditions;
  forecastAtPlannedStart: WeatherConditions;
  hourlyForecast: WeatherConditions[];
  retrievedAt: string;
  provider: "Open-Meteo";
};

export type WeatherFetch = typeof fetch;
export type WeatherOptions = { fetcher?: WeatherFetch; now?: Date; forecastDays?: number };

type OpenMeteoResponse = {
  current?: Record<string, unknown>;
  hourly?: Record<string, unknown>;
  daily?: Record<string, unknown>;
};

function numberAt(value: unknown, index: number): number {
  const result = Array.isArray(value) ? value[index] : undefined;
  if (typeof result !== "number" || !Number.isFinite(result)) throw new Error("Invalid weather values");
  return result;
}

function currentNumber(value: unknown): number {
  if (typeof value !== "number" || !Number.isFinite(value)) throw new Error("Invalid current weather values");
  return value;
}

function toWeatherConditions(source: Record<string, unknown>, index?: number): WeatherConditions {
  const read = (key: string) => index === undefined ? currentNumber(source[key]) : numberAt(source[key], index);
  return {
    time: read("time") * 1000, temperatureF: read("temperature_2m"), apparentTemperatureF: read("apparent_temperature"),
    windSpeedMph: read("wind_speed_10m"), windGustsMph: read("wind_gusts_10m"),
    precipitationProbability: read("precipitation_probability"), precipitationInches: read("precipitation"),
    weatherCode: read("weather_code"),
    // Open-Meteo returns visibility in feet when imperial units are requested.
    // Convert at the provider boundary so all downstream thresholds remain metres.
    visibilityMeters: feetToMeters(read("visibility")),
  };
}

function localDateKey(timestamp: number): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TRAILSAFE_TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(timestamp));
}

/** Fetches current conditions and a planned-start-aligned hourly forecast from Open-Meteo. */
export async function getTrailWeather(trail: Trail, plannedStartTime: string | Date = new Date(), options: WeatherOptions = {}): Promise<TrailWeather> {
  if (trail.latitude == null || trail.longitude == null) throw new Error(`Missing coordinates for ${trail.name}`);
  const plannedStart = new Date(plannedStartTime).getTime();
  if (!Number.isFinite(plannedStart)) throw new Error("Invalid planned start time");
  const params = new URLSearchParams({
    latitude: String(trail.latitude), longitude: String(trail.longitude),
    current: "temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,visibility",
    hourly: "temperature_2m,apparent_temperature,precipitation_probability,precipitation,weather_code,wind_speed_10m,wind_gusts_10m,visibility",
    daily: "sunrise,sunset", temperature_unit: "fahrenheit", wind_speed_unit: "mph", precipitation_unit: "inch",
    timezone: TRAILSAFE_TIME_ZONE, timeformat: "unixtime", forecast_days: String(options.forecastDays ?? 16),
  });
  const response = await (options.fetcher ?? fetch)(`${WEATHER_API_URL}?${params}`, { cache: "no-store" });
  if (!response.ok) throw new Error(`Weather API failed: ${response.status}`);
  const data = await response.json() as OpenMeteoResponse;
  if (!data.current || !data.hourly || !data.daily || !Array.isArray(data.hourly.time) || !Array.isArray(data.daily.sunset) || !Array.isArray(data.daily.sunrise)) throw new Error("Incomplete weather data");

  const hourlyForecast = data.hourly.time.map((_, index) => toWeatherConditions(data.hourly!, index));
  const plannedHour = Math.floor(plannedStart / 3_600_000) * 3_600_000;
  const selectedIndex = hourlyForecast.findIndex((hour) => hour.time === plannedHour);
  if (selectedIndex < 0) throw new Error("Planned start is outside the returned weather forecast");
  const dateIndex = (data.daily.time as unknown[]).findIndex((time) => typeof time === "number" && localDateKey(time * 1000) === localDateKey(plannedStart));
  if (dateIndex < 0) throw new Error("Sunrise and sunset are unavailable for the planned hike date");
  const forecastAtPlannedStart = hourlyForecast[selectedIndex];
  return {
    temperatureF: forecastAtPlannedStart.temperatureF, windSpeedMph: forecastAtPlannedStart.windSpeedMph,
    precipitationProbability: forecastAtPlannedStart.precipitationProbability,
    sunrise: numberAt(data.daily.sunrise, dateIndex) * 1000, sunset: numberAt(data.daily.sunset, dateIndex) * 1000,
    current: toWeatherConditions(data.current), forecastAtPlannedStart, hourlyForecast,
    retrievedAt: (options.now ?? new Date()).toISOString(), provider: "Open-Meteo",
  };
}

export type WeatherScore = { score: number; warnings: SafetyWarning[]; reasons: string[] };

/** Converts selected hike conditions to a transparent 0–100 weather factor. */
export function calculateWeatherScore(conditions: WeatherConditions, verifiedAt: string): WeatherScore {
  const temperature = conditions.apparentTemperatureF >= 45 && conditions.apparentTemperatureF <= 75 ? 100
    : conditions.apparentTemperatureF >= 32 && conditions.apparentTemperatureF <= 85 ? 75 : 35;
  const wind = conditions.windGustsMph <= 20 ? 100 : conditions.windGustsMph <= 35 ? 70 : conditions.windGustsMph <= 50 ? 35 : 0;
  const precipitation = conditions.precipitationProbability <= 20 ? 100 : conditions.precipitationProbability <= 50 ? 70 : conditions.precipitationProbability <= 70 ? 40 : 10;
  const visibility = conditions.visibilityMeters >= 5_000 ? 100 : conditions.visibilityMeters >= 1_000 ? 60 : 20;
  const thunderstorm = [95, 96, 99].includes(conditions.weatherCode);
  const warnings: SafetyWarning[] = [];
  if (thunderstorm || conditions.windGustsMph > 55) warnings.push({ code: thunderstorm ? "thunderstorm" : "dangerous-wind-gusts", message: thunderstorm ? "Thunderstorm conditions are forecast at the planned start." : "Dangerous wind gusts are forecast at the planned start.", severity: "critical", source: "Open-Meteo", verifiedAt });
  else if (conditions.precipitationProbability > 70 || conditions.visibilityMeters < 1_000) warnings.push({ code: "adverse-weather", message: "Adverse precipitation or low-visibility conditions are forecast.", severity: "advisory", source: "Open-Meteo", verifiedAt });
  return { score: Math.round(temperature * 0.25 + wind * 0.35 + precipitation * 0.25 + visibility * 0.15), warnings, reasons: [`Apparent temperature ${conditions.apparentTemperatureF}°F`, `Wind gusts ${conditions.windGustsMph} mph`, `Precipitation probability ${conditions.precipitationProbability}%`] };
}
