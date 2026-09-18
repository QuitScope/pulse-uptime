import { Queue } from "bullmq";
import { redisConnection } from "./connection.js";

export interface CheckJobData {
  monitorId: string;
}

export const checkQueue = new Queue<CheckJobData>("checks", {
  connection: redisConnection,
});

export async function enqueueCheck(monitorId: string): Promise<void> {
  await checkQueue.add(
    "run-check",
    { monitorId },
    {
      jobId: monitorId,
      removeOnComplete: true,
      removeOnFail: true,
    },
  );
}
