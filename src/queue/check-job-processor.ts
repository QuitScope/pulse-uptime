import type { Repository } from "typeorm";
import {
  executeCheck,
  type CheckExecutorDeps,
} from "../domain/check-executor.js";
import type { Monitor } from "../domain/monitor.entity.js";

export interface CheckJobProcessorDeps extends CheckExecutorDeps {
  monitorRepository: Repository<Monitor>;
}

export async function processCheckJob(
  deps: CheckJobProcessorDeps,
  monitorId: string,
): Promise<void> {
  const monitor = await deps.monitorRepository.findOneByOrFail({
    id: monitorId,
  });

  await executeCheck(deps, monitor);
}
