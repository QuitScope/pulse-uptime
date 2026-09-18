import { test } from "tap";
import { resetDatabase } from "./test-helpers/database.js";
import { buildContainer } from "./container.js";
import { AppDataSource } from "./db/data-source.js";
import { Monitor } from "./domain/monitor.entity.js";

test("resolves monitorRepository as a singleton bound to the DataSource", async (t) => {
  await resetDatabase();
  t.teardown(() => AppDataSource.destroy());

  const container = buildContainer();

  const repositoryA = container.resolve("monitorRepository");
  const repositoryB = container.resolve("monitorRepository");

  t.equal(repositoryA, repositoryB);
  t.equal(repositoryA.target, Monitor);
});
