import { buildContainer } from "./container.js";
import { AppDataSource } from "./db/data-source.js";
import { createCheckWorker } from "./queue/check-worker.js";
import { redisConnection } from "./queue/connection.js";
import { logger } from "./logger.js";

async function main(): Promise<void> {
  await AppDataSource.initialize();

  const container = buildContainer();
  const checkWorker = createCheckWorker(container.cradle);

  logger.info("Check worker started, waiting for jobs...");

  const shutdown = async (): Promise<void> => {
    await checkWorker.close();
    await AppDataSource.destroy();
    redisConnection.disconnect();
    process.exit(0);
  };

  process.on("SIGINT", () => void shutdown());
  process.on("SIGTERM", () => void shutdown());
}

main().catch((error: unknown) => {
  logger.error(error);
  process.exit(1);
});
