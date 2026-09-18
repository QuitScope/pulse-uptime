import { test } from "tap";
import { resetDatabase } from "../test-helpers/database.js";
import { buildApp } from "../app.js";
import { buildContainer } from "../container.js";
import { AppDataSource } from "../db/data-source.js";

test("buildApp uses a container passed in explicitly", async (t) => {
  await resetDatabase();
  t.teardown(() => AppDataSource.destroy());

  const container = buildContainer();
  const app = buildApp(container);
  t.teardown(() => app.close());

  const createResponse = await app.inject({
    method: "POST",
    url: "/monitors",
    payload: {
      url: "https://example.com",
      intervalSeconds: 60,
      expectedStatusCode: 200,
    },
  });

  t.equal(createResponse.statusCode, 201);
  const created = createResponse.json();

  const viaContainer = await container.cradle.monitorRepository.findOneBy({
    id: created.id,
  });

  t.ok(viaContainer);
});

test("POST /monitors creates a monitor, GET /monitors lists it", async (t) => {
  await resetDatabase();
  t.teardown(() => AppDataSource.destroy());

  const app = buildApp();
  t.teardown(() => app.close());

  const createResponse = await app.inject({
    method: "POST",
    url: "/monitors",
    payload: {
      url: "https://example.com",
      intervalSeconds: 60,
      expectedStatusCode: 200,
    },
  });

  t.equal(createResponse.statusCode, 201);
  const created = createResponse.json();
  t.equal(created.url, "https://example.com");
  t.equal(created.intervalSeconds, 60);
  t.equal(created.expectedStatusCode, 200);
  t.ok(created.id);

  const listResponse = await app.inject({
    method: "GET",
    url: "/monitors",
  });

  t.equal(listResponse.statusCode, 200);
  const list = listResponse.json();
  t.equal(list.length, 1);
  t.equal(list[0].id, created.id);
});

test("POST /monitors rejects invalid payload", async (t) => {
  await resetDatabase();
  t.teardown(() => AppDataSource.destroy());

  const app = buildApp();
  t.teardown(() => app.close());

  const response = await app.inject({
    method: "POST",
    url: "/monitors",
    payload: {
      url: "https://example.com",
      intervalSeconds: 0,
      expectedStatusCode: 200,
    },
  });

  t.equal(response.statusCode, 400);
});

test("DELETE /monitors/:id removes the monitor", async (t) => {
  await resetDatabase();
  t.teardown(() => AppDataSource.destroy());

  const app = buildApp();
  t.teardown(() => app.close());

  const createResponse = await app.inject({
    method: "POST",
    url: "/monitors",
    payload: {
      url: "https://example.com",
      intervalSeconds: 60,
      expectedStatusCode: 200,
    },
  });
  const created = createResponse.json();

  const deleteResponse = await app.inject({
    method: "DELETE",
    url: `/monitors/${created.id}`,
  });
  t.equal(deleteResponse.statusCode, 204);

  const listResponse = await app.inject({
    method: "GET",
    url: "/monitors",
  });
  t.equal(listResponse.json().length, 0);
});

test("DELETE /monitors/:id returns 404 for unknown monitor", async (t) => {
  await resetDatabase();
  t.teardown(() => AppDataSource.destroy());

  const app = buildApp();
  t.teardown(() => app.close());

  const response = await app.inject({
    method: "DELETE",
    url: "/monitors/00000000-0000-0000-0000-000000000000",
  });

  t.equal(response.statusCode, 404);
});
