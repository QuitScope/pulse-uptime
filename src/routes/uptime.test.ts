import { test } from "tap";
import { resetDatabase } from "../test-helpers/database.js";
import { buildApp } from "../app.js";
import { AppDataSource } from "../db/data-source.js";
import { Monitor } from "../domain/monitor.entity.js";
import { Check } from "../domain/check.entity.js";

test("GET /monitors/:id/uptime returns the uptime percentage", async (t) => {
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
      httpStatus: 500,
      responseTimeMs: 10,
      success: false,
      errorMessage: null,
    }),
  ]);

  const app = buildApp();
  t.teardown(() => app.close());

  const response = await app.inject({
    method: "GET",
    url: `/monitors/${monitor.id}/uptime`,
  });

  t.equal(response.statusCode, 200);
  const body = response.json();
  t.equal(body.totalChecks, 2);
  t.equal(body.successfulChecks, 1);
  t.equal(body.uptimePercentage, 50);
});

test("GET /monitors/:id/uptime returns 404 for unknown monitor", async (t) => {
  await resetDatabase();
  t.teardown(() => AppDataSource.destroy());

  const app = buildApp();
  t.teardown(() => app.close());

  const response = await app.inject({
    method: "GET",
    url: "/monitors/00000000-0000-0000-0000-000000000000/uptime",
  });

  t.equal(response.statusCode, 404);
});
