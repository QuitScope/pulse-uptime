import type { FastifyInstance } from "fastify";
import { redisConnection } from "../queue/connection.js";

export async function healthRoutes(app: FastifyInstance): Promise<void> {
  app.get("/health", async (request, reply) => {
    const dataSource = request.diScope.resolve("dataSource");

    const [databaseOk, redisOk] = await Promise.all([
      dataSource
        .query("SELECT 1")
        .then(() => true)
        .catch(() => false),
      redisConnection
        .ping()
        .then(() => true)
        .catch(() => false),
    ]);

    const checks = {
      database: databaseOk ? "ok" : "error",
      redis: redisOk ? "ok" : "error",
    };

    if (!databaseOk || !redisOk) {
      reply.code(503);
      return { status: "error", checks };
    }

    return { status: "ok", checks };
  });
}
