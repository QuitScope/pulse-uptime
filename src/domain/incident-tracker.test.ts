import { test } from "tap";
import { resetDatabase } from "../test-helpers/database.js";
import { AppDataSource } from "../db/data-source.js";
import { Monitor } from "./monitor.entity.js";
import { Check } from "./check.entity.js";
import { Incident } from "./incident.entity.js";
import { trackIncident } from "./incident-tracker.js";

async function createMonitor() {
  const repository = AppDataSource.getRepository(Monitor);
  return repository.save(
    repository.create({
      url: "https://example.com",
      intervalSeconds: 60,
      expectedStatusCode: 200,
    }),
  );
}

async function saveCheck(monitor: Monitor, success: boolean) {
  const repository = AppDataSource.getRepository(Check);
  return repository.save(
    repository.create({
      monitor,
      httpStatus: success ? 200 : 500,
      responseTimeMs: 10,
      success,
      errorMessage: success ? null : "boom",
    }),
  );
}

test("first failing check opens a new incident", async (t) => {
  await resetDatabase();
  t.teardown(() => AppDataSource.destroy());

  const monitor = await createMonitor();
  const check = await saveCheck(monitor, false);
  const incidentRepository = AppDataSource.getRepository(Incident);

  const incident = await trackIncident(incidentRepository, monitor, check);

  t.ok(incident);
  t.equal(incident?.resolvedAt, null);
  t.same(incident?.startedAt, check.checkedAt);
});

test("second failing check reuses the open incident", async (t) => {
  await resetDatabase();
  t.teardown(() => AppDataSource.destroy());

  const monitor = await createMonitor();
  const incidentRepository = AppDataSource.getRepository(Incident);

  const firstCheck = await saveCheck(monitor, false);
  const firstIncident = await trackIncident(
    incidentRepository,
    monitor,
    firstCheck,
  );

  const secondCheck = await saveCheck(monitor, false);
  const secondIncident = await trackIncident(
    incidentRepository,
    monitor,
    secondCheck,
  );

  t.equal(secondIncident?.id, firstIncident?.id);
  t.equal(secondIncident?.resolvedAt, null);

  const count = await incidentRepository.count();
  t.equal(count, 1);
});

test("successful check closes the open incident", async (t) => {
  await resetDatabase();
  t.teardown(() => AppDataSource.destroy());

  const monitor = await createMonitor();
  const incidentRepository = AppDataSource.getRepository(Incident);

  const failedCheck = await saveCheck(monitor, false);
  await trackIncident(incidentRepository, monitor, failedCheck);

  const recoveredCheck = await saveCheck(monitor, true);
  const resolved = await trackIncident(
    incidentRepository,
    monitor,
    recoveredCheck,
  );

  t.ok(resolved);
  t.same(resolved?.resolvedAt, recoveredCheck.checkedAt);
});

test("successful check with no open incident does nothing", async (t) => {
  await resetDatabase();
  t.teardown(() => AppDataSource.destroy());

  const monitor = await createMonitor();
  const incidentRepository = AppDataSource.getRepository(Incident);

  const check = await saveCheck(monitor, true);
  const result = await trackIncident(incidentRepository, monitor, check);

  t.equal(result, null);
  const count = await incidentRepository.count();
  t.equal(count, 0);
});
