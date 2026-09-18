import type { Repository } from "typeorm";
import type { Check } from "./check.entity.js";

export interface UptimeStats {
  totalChecks: number;
  successfulChecks: number;
  uptimePercentage: number | null;
}

export async function calculateUptime(
  checkRepository: Repository<Check>,
  monitorId: string,
): Promise<UptimeStats> {
  const raw = await checkRepository
    .createQueryBuilder("check")
    .select("COUNT(*)", "total")
    .addSelect("COUNT(*) FILTER (WHERE check.success = true)", "successful")
    .where("check.monitor_id = :monitorId", { monitorId })
    .getRawOne<{ total: string; successful: string }>();

  const totalChecks = Number(raw?.total ?? 0);
  const successfulChecks = Number(raw?.successful ?? 0);

  return {
    totalChecks,
    successfulChecks,
    uptimePercentage:
      totalChecks === 0 ? null : (successfulChecks / totalChecks) * 100,
  };
}
