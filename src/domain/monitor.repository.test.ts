import { test } from "tap";
import { resetDatabase } from "../test-helpers/database.js";
import { AppDataSource } from "../db/data-source.js";
import { Monitor } from "./monitor.entity.js";

test("persists and reloads a Monitor", async (t) => {
  await resetDatabase();
  t.teardown(() => AppDataSource.destroy());

  const repository = AppDataSource.getRepository(Monitor);

  const monitor = repository.create({
    url: "https://example.com",
    intervalSeconds: 60,
    expectedStatusCode: 200,
  });
  const saved = await repository.save(monitor);

  const reloaded = await repository.findOneByOrFail({ id: saved.id });

  t.equal(reloaded.url, "https://example.com");
  t.equal(reloaded.intervalSeconds, 60);
  t.equal(reloaded.expectedStatusCode, 200);
  t.ok(reloaded.createdAt instanceof Date);
});
