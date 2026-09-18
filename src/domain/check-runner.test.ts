import { test } from "tap";
import { createServer } from "node:http";
import { runCheck } from "./check-runner.js";

test("runCheck reports success when status matches expectation", async (t) => {
  const server = createServer((_req, res) => {
    res.writeHead(200);
    res.end();
  });
  await new Promise<void>((resolve) => server.listen(0, resolve));
  t.teardown(() => server.close());
  const address = server.address();
  if (typeof address !== "object" || address === null) {
    throw new Error("expected server to listen on a port");
  }

  const result = await runCheck({
    url: `http://127.0.0.1:${address.port}`,
    expectedStatusCode: 200,
  });

  t.equal(result.httpStatus, 200);
  t.equal(result.success, true);
  t.equal(result.errorMessage, null);
  t.ok(result.responseTimeMs >= 0);
  t.ok(Number.isInteger(result.responseTimeMs));
});

test("runCheck reports failure when status does not match expectation", async (t) => {
  const server = createServer((_req, res) => {
    res.writeHead(500);
    res.end();
  });
  await new Promise<void>((resolve) => server.listen(0, resolve));
  t.teardown(() => server.close());
  const address = server.address();
  if (typeof address !== "object" || address === null) {
    throw new Error("expected server to listen on a port");
  }

  const result = await runCheck({
    url: `http://127.0.0.1:${address.port}`,
    expectedStatusCode: 200,
  });

  t.equal(result.httpStatus, 500);
  t.equal(result.success, false);
  t.equal(result.errorMessage, null);
});

test("runCheck tolerates a slow server within the timeout budget", async (t) => {
  const server = createServer((_req, res) => {
    setTimeout(() => {
      res.writeHead(200);
      res.end();
    }, 6000);
  });
  await new Promise<void>((resolve) => server.listen(0, resolve));
  t.teardown(() => server.close());
  const address = server.address();
  if (typeof address !== "object" || address === null) {
    throw new Error("expected server to listen on a port");
  }

  const result = await runCheck({
    url: `http://127.0.0.1:${address.port}`,
    expectedStatusCode: 200,
  });

  t.equal(result.httpStatus, 200);
  t.equal(result.success, true);
  t.equal(result.errorMessage, null);
});

test("runCheck reports failure with error message on network failure", async (t) => {
  const result = await runCheck({
    url: "http://127.0.0.1:1",
    expectedStatusCode: 200,
  });

  t.equal(result.httpStatus, null);
  t.equal(result.success, false);
  t.ok(result.errorMessage && result.errorMessage.length > 0);
});
