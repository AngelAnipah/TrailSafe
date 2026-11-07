
export type DaylightResult = {
  score: number;
  estimatedFinish: string;
  sunset: string;
  minutesBeforeSunset: number;
  explanation: string;
};

export function calculateDaylightScore(
  departureTime: string | Date,
  durationMinutes: number,
  sunsetTimestamp: number
): DaylightResult {
  const departure = new Date(departureTime).getTime();

  if (
    !Number.isFinite(departure) ||
    !Number.isFinite(sunsetTimestamp) ||
    !Number.isFinite(durationMinutes) ||
    durationMinutes <= 0
  ) {
    throw new Error("Invalid daylight calculation inputs");
  }

  const estimatedFinish =
    departure + durationMinutes * 60_000;

  const minutesBeforeSunset = Math.round(
    (sunsetTimestamp - estimatedFinish) / 60_000
  );

  const score = minutesBeforeSunset >= 120 ? 100
    : minutesBeforeSunset >= 60 ? 85
      : minutesBeforeSunset >= 30 ? 65
        : minutesBeforeSunset >= 0 ? 40
          : 0;

  const explanation =
    minutesBeforeSunset < 0
      ? `Estimated finish is ${Math.abs(
          minutesBeforeSunset
        )} minutes after sunset.`
      : `Estimated finish is ${minutesBeforeSunset} minutes before sunset.`;

  return {
    score,
    estimatedFinish: new Date(
      estimatedFinish
    ).toISOString(),
    sunset: new Date(sunsetTimestamp).toISOString(),
    minutesBeforeSunset,
    explanation,
  };
}

