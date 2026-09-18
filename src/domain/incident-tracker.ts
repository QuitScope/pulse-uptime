import { IsNull, type Repository } from "typeorm";
import type { Monitor } from "./monitor.entity.js";
import type { Check } from "./check.entity.js";
import { Incident } from "./incident.entity.js";

export async function trackIncident(
  incidentRepository: Repository<Incident>,
  monitor: Monitor,
  check: Check,
): Promise<Incident | null> {
  const openIncident = await incidentRepository.findOne({
    where: { monitor: { id: monitor.id }, resolvedAt: IsNull() },
  });

  if (!check.success) {
    if (openIncident) {
      return openIncident;
    }

    const incident = incidentRepository.create({
      monitor,
      startedAt: check.checkedAt,
      resolvedAt: null,
    });
    return incidentRepository.save(incident);
  }

  if (openIncident) {
    openIncident.resolvedAt = check.checkedAt;
    return incidentRepository.save(openIncident);
  }

  return null;
}
