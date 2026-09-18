import type { Monitor } from "./monitor.entity.js";

export function isMonitorDue(
  monitor: Monitor,
  lastCheckedAt: Date | null,
  now: Date,
): boolean {
  if (lastCheckedAt === null) {
    return true;
  }

  const dueAt = lastCheckedAt.getTime() + monitor.intervalSeconds * 1000;
  return now.getTime() >= dueAt;
}
