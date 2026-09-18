import Fastify, {
  type FastifyError,
  type FastifyInstance,
  type FastifyPluginCallback,
} from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyCompress from "@fastify/compress";
import metricsPlugin from "fastify-metrics";
import { fastifyAwilixPlugin } from "@fastify/awilix";
import type { AwilixContainer } from "awilix";
import { QueryFailedError } from "typeorm";
import { healthRoutes } from "./routes/health.js";
import { monitorRoutes } from "./routes/monitors.js";
import { checkRoutes } from "./routes/checks.js";
import { uptimeRoutes } from "./routes/uptime.js";
import { incidentRoutes } from "./routes/incidents.js";
import { buildContainer, type AppCradle } from "./container.js";
import { env } from "./config/env.js";
import { redisConnection } from "./queue/connection.js";
import { AppError } from "./errors.js";

const metrics = metricsPlugin as unknown as FastifyPluginCallback<{
  endpoint: string;
  clearRegisterOnInit: boolean;
}>;

export function buildApp(
  container: AwilixContainer<AppCradle> = buildContainer(),
): FastifyInstance {
  const app = Fastify({
    logger: {
      level: env.logLevel,
      redact: ["req.headers.authorization"],
    },
  });

  app.register(fastifyCors, {
    origin: env.corsOrigin,
    methods: ["GET", "POST", "DELETE"],
  });
  app.register(fastifyCompress);
  app.register(metrics, { endpoint: "/metrics", clearRegisterOnInit: true });
  app.register(fastifyAwilixPlugin, {
    container,
    disposeOnClose: true,
  });
  app.register(healthRoutes);
  app.register(monitorRoutes);
  app.register(checkRoutes);
  app.register(uptimeRoutes);
  app.register(incidentRoutes);

  app.setErrorHandler((error: FastifyError | AppError, request, reply) => {
    if (error instanceof AppError) {
      reply.code(error.statusCode);
      return { message: error.message, code: error.code };
    }

    if (error.validation) {
      reply.code(400);
      return { message: error.message, code: "VALIDATION_ERROR" };
    }

    if (error instanceof QueryFailedError) {
      request.log.error(error);
      reply.code(400);
      return { message: "Invalid request", code: "BAD_REQUEST" };
    }

    request.log.error(error);
    reply.code(500);
    return { message: "Internal server error", code: "INTERNAL_ERROR" };
  });

  app.addHook("onClose", () => {
    redisConnection.disconnect();
  });

  return app;
}
