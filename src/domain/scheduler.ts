import type { Repository } from "typeorm";
import { isMonitorDue } from "./scheduler-policy.js";
import type { Monitor } from "./monitor.entity.js";
import type { Check } from "./check.entity.js";

export interface SchedulerDeps {
  monitorRepository: Repository<Monitor>;
  checkRepository: Repository<Check>;
  enqueueCheck: (monitorId: string) => Promise<void>;
}

export async function runDueChecks(
  deps: SchedulerDeps,
  now: Date,
): Promise<void> {
  const monitors = await deps.monitorRepository.find();

  for (const monitor of monitors) {
    const lastCheck = await deps.checkRepository.findOne({
      where: { monitor: { id: monitor.id } },
      order: { checkedAt: "DESC" },
    });

    if (isMonitorDue(monitor, lastCheck?.checkedAt ?? null, now)) {
      await deps.enqueueCheck(monitor.id);
    }
  }
}
