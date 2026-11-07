
import { trails } from "@/data/trails";
import { getTrailWeather } from "@/lib/weather";

export default async function WeatherTestPage() {
  const donutFalls = trails.find(
    (trail) => trail.id === "donut-falls"
  );

  if (!donutFalls) {
    return <p>Donut Falls was not found.</p>;
  }

  try {
    const weather = await getTrailWeather(donutFalls);

    return (
      <main style={{ padding: "40px" }}>
        <h1>Donut Falls - Live Weather Test</h1>
        <p>Temperature: {weather.temperatureF} °F</p>
        <p>Wind Speed: {weather.windSpeedMph} mph</p>
        <p>
          Precipitation Probability:{" "}
          {weather.precipitationProbability}%
        </p>
        <p>Sunset: {weather.sunset}</p>
        <p>
          Source: Open-Meteo (live forecast)
        </p>
      </main>
    );
  } catch (error) {
    return (
      <main style={{ padding: "40px" }}>
        <h1>Weather Test Failed</h1>
        <p>
          {error instanceof Error
            ? error.message
            : "Unknown error"}
        </p>
      </main>
    );
  }
}
