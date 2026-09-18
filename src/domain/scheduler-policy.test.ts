import { test } from "tap";
import { isMonitorDue } from "./scheduler-policy.js";
import type { Monitor } from "./monitor.entity.js";

function makeMonitor(intervalSeconds: number): Monitor {
  return {
    id: "monitor-1",
    url: "https://example.com",
    intervalSeconds,
    expectedStatusCode: 200,
    createdAt: new Date(),
  };
}

test("is due when never checked before", (t) => {
  const monitor = makeMonitor(60);
  t.equal(isMonitorDue(monitor, null, new Date()), true);
  t.end();
});

test("is not due when last check is within the interval", (t) => {
  const monitor = makeMonitor(60);
  const now = new Date("2026-01-01T00:01:00.000Z");
  const lastCheckedAt = new Date("2026-01-01T00:00:30.000Z");

  t.equal(isMonitorDue(monitor, lastCheckedAt, now), false);
  t.end();
});

test("is due when the interval has fully elapsed", (t) => {
  const monitor = makeMonitor(60);
  const now = new Date("2026-01-01T00:01:00.000Z");
  const lastCheckedAt = new Date("2026-01-01T00:00:00.000Z");

  t.equal(isMonitorDue(monitor, lastCheckedAt, now), true);
  t.end();
});
