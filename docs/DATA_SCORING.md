# TrailSafe data and scoring handoff

The UI should call `getTrailSafetyAssessment(trail, plannedStartTime, options?)` from `@/lib/safety-assessment` in a Server Component, Route Handler, or server-side service. Do not call it from a browser Client Component: it fetches provider data and sends a descriptive User-Agent to the Utah Avalanche Center.

```ts
const assessment = await getTrailSafetyAssessment(trail, "2026-12-10T08:00:00-07:00");
```

`assessment.score` is `number | null`; `assessment.category` is `Go`, `Caution`, `Avoid`, or `Unavailable`. Render an unavailable state—not a numeric recommendation—when the score is `null`.

```ts
{
  trailId: "donut-falls",
  category: "Caution",
  score: 72,
  scoring: {
    breakdown: { weather: 70, avalanche: 75, daylight: 100, difficulty: 64 },
    weights: { weather: 0.4, avalanche: 0.3, daylight: 0.2, difficulty: 0.1 }
  },
  weather: { provider: "Open-Meteo", retrievedAt: "2026-12-10T14:02:00.000Z" },
  avalanche: { danger: "Moderate", sourceUrl: "https://utahavalanchecenter.org/forecast/salt-lake/json" }
}
```

## Data status

- Open-Meteo weather is live: current conditions, planned-start-aligned hourly conditions, sunrise, sunset, and retrieval timestamp.
- Utah Avalanche Center danger is live only when its documented JSON response contains a valid, unexpired overall danger rose and issue/expiry timestamps. Network, parse, seasonal no-rating, and expired-data failures return `Unavailable`; the system does not infer a rating.
- Trailhead coordinates, estimated durations, forecast regions, and avalanche applicability are maintained manual metadata in `src/data/trails.ts`. Each coordinate has a reference record.
- Difficulty is a deterministic rule using the declared difficulty, distance, and elevation gain.
- The Narrows always requires caller-provided, fresh `flash-flood` and `river-condition` checks through `options.conditionChecks`. Until both are provided, its assessment is `Unavailable`.

## Avalanche applicability

For a trail marked `avalancheRegion: "not-applicable"`, avalanche has no score and is not assumed low. The remaining 70% of the TrailSafe model is normalized: weather 57.14%, daylight 28.57%, difficulty 14.29%. Routes in an avalanche region require a valid UAC score; a missing or stale forecast makes the entire assessment unavailable.

## Interfaces and helper functions

- `Trail`, `AvalancheRegion`, `CoordinateReference`: `@/types/trail`
- `TrailWeather`, `WeatherConditions`, `getTrailWeather`, `calculateWeatherScore`: `@/lib/weather`
- `AvalancheConditions`, `getAvalancheConditions`: `@/lib/avalanche`
- `DaylightResult`, `calculateDaylightScore`: `@/lib/daylight`
- `SafetyWarning`, `ScoringResult`, `calculateSafetyScore`, `calculateDifficultyScore`: `@/lib/scoring`
- `TrailSafetyAssessment`, `TrailSafetyAssessmentOptions`, `RequiredConditionCheck`, `getTrailSafetyAssessment`: `@/lib/safety-assessment`

The existing `safetyScore` and `safetyRationale` fields remain in the Trail type and trail data solely for frontend compatibility. They are demo values and should be replaced only when the frontend team adopts `TrailSafetyAssessment`.
