export type HikeHistoryEntry = {
  id: string;
  at: number;
  label: string;
};

type LegacyHistoryEntry = Partial<HikeHistoryEntry> & {
  at?: unknown;
  id?: unknown;
  label?: unknown;
};

function legacyId(at: number, label: string, index: number) {
  const normalizedLabel = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "event";
  return `legacy-${at}-${index}-${normalizedLabel}`;
}

/** Migrates pre-ID records without changing their stored chronological order. */
export function normalizeHistory(entries: unknown): HikeHistoryEntry[] {
  if (!Array.isArray(entries)) return [];

  const usedIds = new Set<string>();
  return entries.flatMap((entry, index) => {
    const legacy = entry as LegacyHistoryEntry;
    if (typeof legacy.at !== "number" || !Number.isFinite(legacy.at) || typeof legacy.label !== "string") return [];

    const candidate = typeof legacy.id === "string" && legacy.id.trim() ? legacy.id : legacyId(legacy.at, legacy.label, index);
    let id = candidate;
    let suffix = 1;
    while (usedIds.has(id)) id = `${candidate}-${suffix++}`;
    usedIds.add(id);
    return [{ id, at: legacy.at, label: legacy.label }];
  });
}

/** Generates a stable ID when a user action creates an event, never while rendering. */
export function createHistoryEntry(entries: HikeHistoryEntry[], at: number, label: string): HikeHistoryEntry {
  const prefix = `event-${at}-`;
  const sequence = entries.reduce((count, entry) => count + Number(entry.id.startsWith(prefix)), 0);
  return { id: `${prefix}${sequence}`, at, label };
}

/** Ignores accidental duplicate dispatches of the exact same action, but permits later check-ins. */
export function appendHistoryEntry(entries: HikeHistoryEntry[], at: number, label: string): HikeHistoryEntry[] {
  if (entries.some((entry) => entry.at === at && entry.label === label)) return entries;
  return [...entries, createHistoryEntry(entries, at, label)];
}

/** A check-in deliberately records only the check-in; it does not alter a deadline. */
export function recordCheckIn(entries: HikeHistoryEntry[], at: number) {
  return { history: appendHistoryEntry(entries, at, "Checked in — I’m OK"), lastCheckIn: at };
}

/** Returns null when a 30-minute extension would still leave the hike overdue. */
export function extendReturnTime(expectedReturn: number, virtualNow: number) {
  const candidate = expectedReturn + 30 * 60_000;
  return candidate > virtualNow ? candidate : null;
}

/** Validates the explicit deadline required to check in during the overdue grace period. */
export function validateFutureReturnTime(input: string, virtualNow: number) {
  const selected = new Date(input).getTime();
  return Number.isFinite(selected) && selected > virtualNow ? selected : null;
}
