import { test } from "tap";
import { createServer } from "node:http";
import { resetDatabase } from "../test-helpers/database.js";
import { buildApp } from "../app.js";
import { AppDataSource } from "../db/data-source.js";
import { Monitor } from "../domain/monitor.entity.js";

test("POST /monitors/:id/checks runs a check and persists the result", async (t) => {
  await resetDatabase();
  t.teardown(() => AppDataSource.destroy());

  const targetServer = createServer((_req, res) => {
    res.writeHead(200);
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

  const app = buildApp();
  t.teardown(() => app.close());

  const response = await app.inject({
    method: "POST",
    url: `/monitors/${monitor.id}/checks`,
  });

  t.equal(response.statusCode, 201);
  const body = response.json();
  t.equal(body.httpStatus, 200);
  t.equal(body.success, true);
  t.ok(typeof body.responseTimeMs === "number");
});

test("POST /monitors/:id/checks opens and resolves an incident", async (t) => {
  await resetDatabase();
  t.teardown(() => AppDataSource.destroy());

  let statusToReturn = 500;
  const targetServer = createServer((_req, res) => {
    res.writeHead(statusToReturn);
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

  const app = buildApp();
  t.teardown(() => app.close());

  await app.inject({ method: "POST", url: `/monitors/${monitor.id}/checks` });

  const afterFailure = await app.inject({
    method: "GET",
    url: `/monitors/${monitor.id}/incidents`,
  });
  const incidentsAfterFailure = afterFailure.json();
  t.equal(incidentsAfterFailure.length, 1);
  t.equal(incidentsAfterFailure[0].resolvedAt, null);

  statusToReturn = 200;
  await app.inject({ method: "POST", url: `/monitors/${monitor.id}/checks` });

  const afterRecovery = await app.inject({
    method: "GET",
    url: `/monitors/${monitor.id}/incidents`,
  });
  const incidentsAfterRecovery = afterRecovery.json();
  t.equal(incidentsAfterRecovery.length, 1);
  t.ok(incidentsAfterRecovery[0].resolvedAt !== null);
});

test("POST /monitors/:id/checks returns 404 for unknown monitor", async (t) => {
  await resetDatabase();
  t.teardown(() => AppDataSource.destroy());

  const app = buildApp();
  t.teardown(() => app.close());

  const response = await app.inject({
    method: "POST",
    url: "/monitors/00000000-0000-0000-0000-000000000000/checks",
  });

  t.equal(response.statusCode, 404);
});

test("GET /monitors/:id/checks returns recent checks newest first", async (t) => {
  await resetDatabase();
  t.teardown(() => AppDataSource.destroy());

  const targetServer = createServer((_req, res) => {
    res.writeHead(200);
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

  const app = buildApp();
  t.teardown(() => app.close());

  await app.inject({ method: "POST", url: `/monitors/${monitor.id}/checks` });
  await app.inject({ method: "POST", url: `/monitors/${monitor.id}/checks` });

  const response = await app.inject({
    method: "GET",
    url: `/monitors/${monitor.id}/checks`,
  });

  t.equal(response.statusCode, 200);
  const body = response.json();
  t.equal(body.length, 2);
  t.ok(new Date(body[0].checkedAt) >= new Date(body[1].checkedAt));
});

test("GET /monitors/:id/checks returns 404 for unknown monitor", async (t) => {
  await resetDatabase();
  t.teardown(() => AppDataSource.destroy());

  const app = buildApp();
  t.teardown(() => app.close());

  const response = await app.inject({
    method: "GET",
    url: "/monitors/00000000-0000-0000-0000-000000000000/checks",
  });

  t.equal(response.statusCode, 404);
});
