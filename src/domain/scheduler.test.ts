import { test } from "tap";
import { resetDatabase } from "../test-helpers/database.js";
import { createTestCheckQueue } from "../test-helpers/queue.js";
import { AppDataSource } from "../db/data-source.js";
import { Monitor } from "./monitor.entity.js";
import { Check } from "./check.entity.js";
import { runDueChecks } from "./scheduler.js";

test("enqueues a check for a monitor that was never checked", async (t) => {
  await resetDatabase();
  t.teardown(() => AppDataSource.destroy());

  const testQueue = createTestCheckQueue();
  await testQueue.queue.obliterate({ force: true });
  t.teardown(() => testQueue.close());

  const monitorRepository = AppDataSource.getRepository(Monitor);
  const monitor = await monitorRepository.save(
    monitorRepository.create({
      url: "https://example.com",
      intervalSeconds: 60,
      expectedStatusCode: 200,
    }),
  );

  const checkRepository = AppDataSource.getRepository(Check);

  await runDueChecks(
    {
      monitorRepository,
      checkRepository,
      enqueueCheck: testQueue.enqueueCheck,
    },
    new Date(),
  );

  const waiting = await testQueue.queue.getJobs(["waiting"]);
  t.equal(waiting.length, 1);
  t.equal(waiting[0]?.data.monitorId, monitor.id);
});

test("does not enqueue a monitor whose interval has not elapsed", async (t) => {
  await resetDatabase();
  t.teardown(() => AppDataSource.destroy());

  const testQueue = createTestCheckQueue();
  await testQueue.queue.obliterate({ force: true });
  t.teardown(() => testQueue.close());

  const monitorRepository = AppDataSource.getRepository(Monitor);
  const monitor = await monitorRepository.save(
    monitorRepository.create({
      url: "https://example.com",
      intervalSeconds: 60,
      expectedStatusCode: 200,
    }),
  );

  const checkRepository = AppDataSource.getRepository(Check);
  const recentCheck = await checkRepository.save(
    checkRepository.create({
      monitor,
      httpStatus: 200,
      responseTimeMs: 10,
      success: true,
      errorMessage: null,
    }),
  );
  await checkRepository.update(recentCheck.id, {
    checkedAt: new Date(Date.now() - 30_000),
  });

  await runDueChecks(
    {
      monitorRepository,
      checkRepository,
      enqueueCheck: testQueue.enqueueCheck,
    },
    new Date(),
  );

  const waiting = await testQueue.queue.getJobs(["waiting"]);
  t.equal(waiting.length, 0);
});

test("enqueues a monitor whose interval has fully elapsed", async (t) => {
  await resetDatabase();
  t.teardown(() => AppDataSource.destroy());

  const testQueue = createTestCheckQueue();
  await testQueue.queue.obliterate({ force: true });
  t.teardown(() => testQueue.close());

  const monitorRepository = AppDataSource.getRepository(Monitor);
  const monitor = await monitorRepository.save(
    monitorRepository.create({
      url: "https://example.com",
      intervalSeconds: 60,
      expectedStatusCode: 200,
    }),
  );

  const checkRepository = AppDataSource.getRepository(Check);
  const oldCheck = await checkRepository.save(
    checkRepository.create({
      monitor,
      httpStatus: 200,
      responseTimeMs: 10,
      success: true,
      errorMessage: null,
    }),
  );
  await checkRepository.update(oldCheck.id, {
    checkedAt: new Date(Date.now() - 90_000),
  });

  await runDueChecks(
    {
      monitorRepository,
      checkRepository,
      enqueueCheck: testQueue.enqueueCheck,
    },
    new Date(),
  );

  const waiting = await testQueue.queue.getJobs(["waiting"]);
  t.equal(waiting.length, 1);
  t.equal(waiting[0]?.data.monitorId, monitor.id);
});
