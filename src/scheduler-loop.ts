import type { AwilixContainer } from "awilix";
import type { AppCradle } from "./container.js";
import { runDueChecks } from "./domain/scheduler.js";
import { enqueueCheck } from "./queue/check-queue.js";
import { logger } from "./logger.js";

export interface Scheduler {
  stop: () => void;
}

export function startScheduler(
  container: AwilixContainer<AppCradle>,
  tickIntervalMs = 1000,
): Scheduler {
  const timer = setInterval(() => {
    const { monitorRepository, checkRepository } = container.cradle;

    runDueChecks(
      { monitorRepository, checkRepository, enqueueCheck },
      new Date(),
    ).catch((error: unknown) => {
      logger.error({ error }, "scheduler tick failed");
    });
  }, tickIntervalMs);

  return {
    stop: () => clearInterval(timer),
  };
}
