import { test } from "tap";
import { resetDatabase } from "../test-helpers/database.js";
import { AppDataSource } from "../db/data-source.js";
import { Monitor } from "./monitor.entity.js";
import { Check } from "./check.entity.js";

test("persists a Check linked to a Monitor", async (t) => {
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
  const check = checkRepository.create({
    monitor,
    httpStatus: 200,
    responseTimeMs: 42,
    success: true,
    errorMessage: null,
  });
  const saved = await checkRepository.save(check);

  const reloaded = await checkRepository.findOneOrFail({
    where: { id: saved.id },
    relations: { monitor: true },
  });

  t.equal(reloaded.httpStatus, 200);
  t.equal(reloaded.responseTimeMs, 42);
  t.equal(reloaded.success, true);
  t.equal(reloaded.errorMessage, null);
  t.equal(reloaded.monitor.id, monitor.id);
  t.ok(reloaded.checkedAt instanceof Date);

  const driftMs = Math.abs(Date.now() - reloaded.checkedAt.getTime());
  t.ok(
    driftMs < 60_000,
    `checkedAt should be close to wall-clock now, drifted ${driftMs}ms (timezone bug regression)`,
  );
});
