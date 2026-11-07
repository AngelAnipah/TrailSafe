import type { AvalancheRegion, Trail } from "../types/trail";
import type { SafetyWarning } from "./scoring";

export const UTAH_AVALANCHE_CENTER_URL = "https://utahavalanchecenter.org/forecast";
export type AvalancheDanger = "Low" | "Moderate" | "Considerable" | "High" | "Extreme";
export type AvalancheConditions = {
  applicable: boolean;
  available: boolean;
  danger: AvalancheDanger | null;
  score: number | null;
  region: AvalancheRegion;
  issuedAt: string | null;
  expiresAt: string | null;
  retrievedAt: string;
  sourceUrl: string | null;
  warnings: SafetyWarning[];
  reason?: string;
};
export type AvalancheFetch = typeof fetch;
export type AvalancheOptions = { fetcher?: AvalancheFetch; now?: Date; userAgent?: string };

const scoreByDanger: Record<AvalancheDanger, number> = { Low: 100, Moderate: 75, Considerable: 45, High: 15, Extreme: 0 };
const dangerByRoseValue: Record<number, AvalancheDanger | null> = { 0: null, 1: "Low", 2: "Low", 3: "Moderate", 4: "Moderate", 5: "Considerable", 6: "Considerable", 7: "High", 8: "High", 9: "Extreme", 10: "Extreme" };

function unavailable(trail: Trail, reason: string, now: Date): AvalancheConditions {
  return { applicable: trail.avalancheRegion !== "not-applicable", available: false, danger: null, score: null, region: trail.avalancheRegion, issuedAt: null, expiresAt: null, retrievedAt: now.toISOString(), sourceUrl: trail.avalancheRegion === "not-applicable" ? null : `${UTAH_AVALANCHE_CENTER_URL}/${trail.avalancheRegion}`, warnings: [], reason };
}

function findValues(value: unknown, keys: string[], results: unknown[] = []): unknown[] {
  if (Array.isArray(value)) value.forEach((entry) => findValues(entry, keys, results));
  else if (value && typeof value === "object") Object.entries(value as Record<string, unknown>).forEach(([key, entry]) => {
    if (keys.includes(key.toLowerCase())) results.push(entry);
    findValues(entry, keys, results);
  });
  return results;
}

function firstDate(payload: unknown, keys: string[]): Date | null {
  for (const value of findValues(payload, keys)) {
    if (typeof value === "string" || typeof value === "number") {
      const parsed = new Date(value).getTime();
      if (Number.isFinite(parsed)) return new Date(parsed);
    }
  }
  return null;
}

/** Reads only UAC's documented overall danger rose; absent/expired forecasts remain unavailable. */
export async function getAvalancheConditions(trail: Trail, options: AvalancheOptions = {}): Promise<AvalancheConditions> {
  const now = options.now ?? new Date();
  if (trail.avalancheRegion === "not-applicable") return { applicable: false, available: true, danger: null, score: null, region: trail.avalancheRegion, issuedAt: null, expiresAt: null, retrievedAt: now.toISOString(), sourceUrl: null, warnings: [], reason: "Avalanche forecast is not applicable to this route." };
  const sourceUrl = `${UTAH_AVALANCHE_CENTER_URL}/${trail.avalancheRegion}/json`;
  let response: Response;
  try {
    response = await (options.fetcher ?? fetch)(sourceUrl, { cache: "no-store", headers: { "User-Agent": options.userAgent ?? "TrailSafeUT/1.0 (safety-data integration)" } });
  } catch {
    return unavailable(trail, "Utah Avalanche Center forecast could not be retrieved.", now);
  }
  if (!response.ok) {
    // Keep provider status server-side only; it is useful for operations but not a safety instruction.
    console.warn("Utah Avalanche Center forecast request failed", { region: trail.avalancheRegion, status: response.status });
    return unavailable(trail, response.status === 401
      ? "Avalanche advisory unavailable — authorized data access required."
      : "Avalanche advisory is temporarily unavailable. Do not assume low risk.", now);
  }
  let payload: unknown;
  try { payload = await response.json(); } catch { return unavailable(trail, "Utah Avalanche Center returned an invalid forecast payload.", now); }
  const roses = findValues(payload, ["overall_danger_rose"]);
  const rose = roses.find((value): value is unknown[] => Array.isArray(value));
  const ratings = rose?.filter((value): value is number => typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 10) ?? [];
  const maxRating = ratings.length ? Math.max(...ratings) : 0;
  const danger = dangerByRoseValue[maxRating];
  const issued = firstDate(payload, ["date_issued", "issued_at", "issued", "dateissued"]);
  const expires = firstDate(payload, ["expires", "expires_at", "expiration", "date_expires"]);
  if (!danger || !issued || !expires || expires.getTime() <= now.getTime()) return unavailable(trail, "Utah Avalanche Center has no current, rated forecast for this trail's region.", now);
  const warningText = findValues(payload, ["avalanche_warning", "warning"]).find((value): value is string => typeof value === "string" && value.trim().length > 0);
  const warnings: SafetyWarning[] = [
    ...(warningText ? [{ code: "uac-avalanche-warning", message: warningText, severity: "critical" as const, source: "Utah Avalanche Center", verifiedAt: issued.toISOString() }] : []),
    ...(danger === "High" || danger === "Extreme" ? [{ code: "high-avalanche-danger", message: `${danger} avalanche danger is forecast.`, severity: "critical" as const, source: "Utah Avalanche Center", verifiedAt: issued.toISOString() }] : []),
  ];
  return { applicable: true, available: true, danger, score: scoreByDanger[danger], region: trail.avalancheRegion, issuedAt: issued.toISOString(), expiresAt: expires.toISOString(), retrievedAt: now.toISOString(), sourceUrl, warnings };
}
