import type { Repository } from "typeorm";
import { runCheck } from "./check-runner.js";
import { trackIncident } from "./incident-tracker.js";
import type { Monitor } from "./monitor.entity.js";
import type { Check } from "./check.entity.js";
import type { Incident } from "./incident.entity.js";

export interface CheckExecutorDeps {
  checkRepository: Repository<Check>;
  incidentRepository: Repository<Incident>;
}

export async function executeCheck(
  deps: CheckExecutorDeps,
  monitor: Monitor,
): Promise<Check> {
  const result = await runCheck(monitor);

  const check = deps.checkRepository.create({
    monitor,
    httpStatus: result.httpStatus,
    responseTimeMs: result.responseTimeMs,
    success: result.success,
    errorMessage: result.errorMessage,
  });
  const saved = await deps.checkRepository.save(check);

  await trackIncident(deps.incidentRepository, monitor, saved);

  return saved;
}
