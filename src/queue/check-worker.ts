import { Worker } from "bullmq";
import { redisConnection } from "./connection.js";
import type { CheckJobData } from "./check-queue.js";
import {
  processCheckJob,
  type CheckJobProcessorDeps,
} from "./check-job-processor.js";
import { logger } from "../logger.js";

export function createCheckWorker(deps: CheckJobProcessorDeps): Worker {
  const worker = new Worker<CheckJobData>(
    "checks",
    async (job) => {
      await processCheckJob(deps, job.data.monitorId);
    },
    { connection: redisConnection },
  );

  worker.on("failed", (job, error) => {
    logger.error({ error, monitorId: job?.data.monitorId }, "check job failed");
  });

  return worker;
}
