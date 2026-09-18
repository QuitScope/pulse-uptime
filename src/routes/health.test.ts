import { test } from "tap";
import { buildApp } from "../app.js";
import { resetDatabase } from "../test-helpers/database.js";
import { AppDataSource } from "../db/data-source.js";

test("GET /health returns 200 with status ok when dependencies are up", async (t) => {
  await resetDatabase();
  t.teardown(() => AppDataSource.destroy());

  const app = buildApp();
  t.teardown(() => app.close());

  const response = await app.inject({
    method: "GET",
    url: "/health",
  });

  t.equal(response.statusCode, 200);
  t.same(response.json(), {
    status: "ok",
    checks: { database: "ok", redis: "ok" },
  });
});
