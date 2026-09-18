import { test } from "tap";
import { createServer } from "node:http";
import { resetDatabase } from "../test-helpers/database.js";
import { AppDataSource } from "../db/data-source.js";
import { Monitor } from "./monitor.entity.js";
import { Check } from "./check.entity.js";
import { Incident } from "./incident.entity.js";
import { executeCheck } from "./check-executor.js";

test("executeCheck persists a Check and opens an incident on failure", async (t) => {
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

  const saved = await executeCheck(
    { checkRepository, incidentRepository },
    monitor,
  );

  t.equal(saved.httpStatus, 500);
  t.equal(saved.success, false);

  const incidentCount = await incidentRepository.count();
  t.equal(incidentCount, 1);
});
