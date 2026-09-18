import { buildApp } from "./app.js";
import { buildContainer } from "./container.js";
import { AppDataSource } from "./db/data-source.js";
import { startScheduler } from "./scheduler-loop.js";
import { logger } from "./logger.js";

async function main(): Promise<void> {
  await AppDataSource.initialize();

  const container = buildContainer();
  const app = buildApp(container);
  const scheduler = startScheduler(container);

  const shutdown = async (): Promise<void> => {
    scheduler.stop();
    await app.close();
    await AppDataSource.destroy();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown());
  process.on("SIGTERM", () => void shutdown());

  await app.listen({ port: 3000, host: "0.0.0.0" });
}

main().catch((error: unknown) => {
  logger.error(error);
  process.exit(1);
});
