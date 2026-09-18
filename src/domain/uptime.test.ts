import { test } from "tap";
import { resetDatabase } from "../test-helpers/database.js";
import { AppDataSource } from "../db/data-source.js";
import { Monitor } from "./monitor.entity.js";
import { Check } from "./check.entity.js";
import { calculateUptime } from "./uptime.js";

test("calculateUptime returns the percentage of successful checks", async (t) => {
  await resetDatabase();
  t.teardown(() => AppDataSource.destroy());

  const monitorRepository = AppDataSource.getRepository(Monitor);
  const monitor = await monitorRepository.save(
    monitorRepository.create({
      url: "https://example.com",
      intervalSeconds: 60,
      expectedStatusCode: 200,
    }),
  );

  const checkRepository = AppDataSource.getRepository(Check);
  await checkRepository.save([
    checkRepository.create({
      monitor,
      httpStatus: 200,
      responseTimeMs: 10,
      success: true,
      errorMessage: null,
    }),
    checkRepository.create({
      monitor,
      httpStatus: 200,
      responseTimeMs: 12,
      success: true,
      errorMessage: null,
    }),
    checkRepository.create({
      monitor,
      httpStatus: 500,
      responseTimeMs: 15,
      success: false,
      errorMessage: null,
    }),
    checkRepository.create({
      monitor,
      httpStatus: null,
      responseTimeMs: 5000,
      success: false,
      errorMessage: "timeout",
    }),
  ]);

  const stats = await calculateUptime(checkRepository, monitor.id);

  t.equal(stats.totalChecks, 4);
  t.equal(stats.successfulChecks, 2);
  t.equal(stats.uptimePercentage, 50);
});

test("calculateUptime returns null percentage when there are no checks", async (t) => {
  await resetDatabase();
  t.teardown(() => AppDataSource.destroy());

  const monitorRepository = AppDataSource.getRepository(Monitor);
  const monitor = await monitorRepository.save(
    monitorRepository.create({
      url: "https://example.com",
      intervalSeconds: 60,
      expectedStatusCode: 200,
    }),
  );

  const checkRepository = AppDataSource.getRepository(Check);
  const stats = await calculateUptime(checkRepository, monitor.id);

  t.equal(stats.totalChecks, 0);
  t.equal(stats.successfulChecks, 0);
  t.equal(stats.uptimePercentage, null);
});
