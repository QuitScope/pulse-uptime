import { test } from "tap";
import { createServer } from "node:http";
import { resetDatabase } from "../test-helpers/database.js";
import { AppDataSource } from "../db/data-source.js";
import { Monitor } from "../domain/monitor.entity.js";
import { Check } from "../domain/check.entity.js";
import { Incident } from "../domain/incident.entity.js";
import { processCheckJob } from "./check-job-processor.js";

test("processCheckJob loads the monitor and executes a check", async (t) => {
  await resetDatabase();
  t.teardown(() => AppDataSource.destroy());

  const targetServer = createServer((_req, res) => {
    res.writeHead(500);
    res.end();
  });
  await new Promise<void>((resolve) => targetServer.listen(0, resolve));
  t.teardown(() => targetServer.close());
  const address = targetServer.address();
  if (typeof address !== "object" || address === null) {
    throw new Error("expected server to listen on a port");
  }

  const monitorRepository = AppDataSource.getRepository(Monitor);
  const monitor = await monitorRepository.save(
    monitorRepository.create({
      url: `http://127.0.0.1:${address.port}`,
      intervalSeconds: 60,
      expectedStatusCode: 200,
    }),
  );

  const checkRepository = AppDataSource.getRepository(Check);
  const incidentRepository = AppDataSource.getRepository(Incident);

  await processCheckJob(
    { monitorRepository, checkRepository, incidentRepository },
    monitor.id,
  );

  const checkCount = await checkRepository.count();
  t.equal(checkCount, 1);

  const incidentCount = await incidentRepository.count();
  t.equal(incidentCount, 1);
});

test("processCheckJob throws for an unknown monitor id", async (t) => {
  await resetDatabase();
  t.teardown(() => AppDataSource.destroy());

  const monitorRepository = AppDataSource.getRepository(Monitor);
  const checkRepository = AppDataSource.getRepository(Check);
  const incidentRepository = AppDataSource.getRepository(Incident);

  await t.rejects(() =>
    processCheckJob(
      { monitorRepository, checkRepository, incidentRepository },
      "00000000-0000-0000-0000-000000000000",
    ),
  );
});
