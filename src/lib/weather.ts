export const WEATHER_API_URL = "https://api.open-meteo.com/v1/forecast";

import type { Trail } from "@/types/trail";

export type TrailWeather = {
  temperatureF: number;
  windSpeedMph: number;
  precipitationProbability: number;
  sunset: string;
};

export async function getTrailWeather(
  trail: Trail
): Promise<TrailWeather> {
  if (trail.latitude == null || trail.longitude == null) {
    throw new Error(`Missing coordinates for ${trail.name}`);
  }

  const params = new URLSearchParams({
    latitude: String(trail.latitude),
    longitude: String(trail.longitude),
    current: "temperature_2m,wind_speed_10m",
    hourly: "precipitation_probability",
    daily: "sunset",
    temperature_unit: "fahrenheit",
    wind_speed_unit: "mph",
    timezone: "America/Denver",
    forecast_days: "2",
  });

  const response = await fetch(
    `https://api.open-meteo.com/v1/forecast?${params}`
  );

  if (!response.ok) {
    throw new Error(
      `Weather API failed: ${response.status}`
    );
  }

  const data = await response.json();

  if (
    !data.current ||
    !data.hourly ||
    !data.daily
  ) {
    throw new Error("Incomplete weather data");
  }

  const probability =
    data.hourly.precipitation_probability?.[0];

  const sunset = data.daily.sunset?.[0];

  if (
    !Number.isFinite(data.current.temperature_2m) ||
    !Number.isFinite(data.current.wind_speed_10m) ||
    !Number.isFinite(probability) ||
    typeof sunset !== "string"
  ) {
    throw new Error("Invalid weather values");
  }

  return {
    temperatureF: data.current.temperature_2m,
    windSpeedMph: data.current.wind_speed_10m,
    precipitationProbability: probability,
    sunset,
  };
}
