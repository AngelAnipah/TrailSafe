
import { trails } from "@/data/trails";
import { getTrailWeather } from "@/lib/weather";
import { calculateDaylightScore } from "@/lib/daylight";
import { connection } from "next/server";
import { Suspense } from "react";

export default function WeatherTestPage() {
  return (
    <Suspense fallback={<main style={{ padding: "40px" }}>Loading live weather…</main>}>
      <WeatherTestContent />
    </Suspense>
  );
}

async function WeatherTestContent() {
  await connection();
  const donutFalls = trails.find(
    (trail) => trail.id === "donut-falls"
  );

  if (!donutFalls) {
    return <p>Donut Falls was not found.</p>;
  }

  const result = await getWeatherTestResult(donutFalls);

  if ("error" in result) {
    return (
      <main style={{ padding: "40px" }}>
        <h1>Weather Test Failed</h1>
        <p>{result.error}</p>
      </main>
    );
  }

  const { weather, daylight } = result;

  return (
    <main style={{ padding: "40px" }}>
      <h1>Donut Falls - Live Weather Test</h1>

      <h2>Current Weather</h2>

      <p>
        Temperature: {weather.temperatureF} °F
      </p>

      <p>
        Wind Speed: {weather.windSpeedMph} mph
      </p>

      <p>
        Precipitation Probability: {" "}
        {weather.precipitationProbability}%
      </p>

      <p>
        Sunset: {" "}
        {new Date(weather.sunset).toLocaleString("en-US", {
          timeZone: "America/Denver",
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </p>

      <hr style={{ margin: "20px 0" }} />

      <h2>Daylight Safety Assessment</h2>

      <p>Example Hiking Duration: 3 hours</p>

      <p>
        Estimated Finish: {" "}
        {new Date(daylight.estimatedFinish).toLocaleString("en-US", {
          timeZone: "America/Denver",
          dateStyle: "medium",
          timeStyle: "short",
        })}
      </p>

      <p>Daylight Score: {daylight.score}/100</p>
      <p>{daylight.explanation}</p>
      <hr style={{ margin: "20px 0" }} />
      <p>Source: Open-Meteo (live forecast)</p>
      <p>Note: This is a prototype assessment, not a guarantee of hiking safety.</p>
    </main>
  );
}

async function getWeatherTestResult(donutFalls: (typeof trails)[number]) {
  try {
    // Get live weather information for Donut Falls.
    const weather = await getTrailWeather(donutFalls);

    // Example: a hiker starts now and hikes for 3 hours.
    const daylight = calculateDaylightScore(
      new Date().toISOString(),
      180,
      weather.sunset
    );

    return { weather, daylight };
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error" };
  }
}
