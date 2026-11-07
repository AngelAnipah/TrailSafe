import assert from "node:assert/strict";
import test from "node:test";
import { appendHistoryEntry, createHistoryEntry, extendReturnTime, normalizeHistory, recordCheckIn, validateFutureReturnTime } from "../src/lib/hike-history.ts";

test("history events created at the same timestamp have unique stable IDs", () => {
  const at = 1_794_031_533_569;
  const first = createHistoryEntry([], at, "Checked in — I’m OK");
  const second = createHistoryEntry([first], at, "Return time extended by 30 minutes");
  assert.notEqual(first.id, second.id);
});

test("legacy saved history receives deterministic IDs in chronological order", () => {
  const legacy = [{ at: 100, label: "Hike started" }, { at: 100, label: "Checked in — I’m OK" }];
  const migrated = normalizeHistory(legacy);
  assert.deepEqual(migrated.map((entry) => entry.at), [100, 100]);
  assert.deepEqual(migrated.map((entry) => entry.id), ["legacy-100-0-hike-started", "legacy-100-1-checked-in-i-m-ok"]);
  assert.deepEqual(normalizeHistory(legacy), migrated);
});

test("one check-in records one event and does not represent a deadline change", () => {
  const expectedReturn = 10_000;
  const checkIn = recordCheckIn([], 9_000);
  assert.equal(checkIn.history.length, 1);
  assert.equal(checkIn.lastCheckIn, 9_000);
  assert.equal(expectedReturn, 10_000);
  assert.equal(recordCheckIn(checkIn.history, 9_000).history.length, 1);
});

test("extension adds exactly thirty minutes only when the resulting deadline is future", () => {
  assert.equal(extendReturnTime(10_000, 9_000), 1_810_000);
  assert.equal(extendReturnTime(10_000, 1_900_000), null);
});

test("overdue check-ins require a user-selected future deadline", () => {
  const now = new Date("2026-11-06T22:00:00-07:00").getTime();
  assert.equal(validateFutureReturnTime("", now), null);
  assert.equal(validateFutureReturnTime("2026-11-06T21:59", now), null);
  assert.ok(validateFutureReturnTime("2026-11-06T22:30", now)! > now);
});

test("identical action dispatches do not duplicate a history event", () => {
  const once = appendHistoryEntry([], 500, "Checked in — I’m OK");
  assert.equal(appendHistoryEntry(once, 500, "Checked in — I’m OK").length, 1);
});
