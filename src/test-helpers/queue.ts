import { Queue } from "bullmq";
import { Redis } from "ioredis";
import { env } from "../config/env.js";
import type { CheckJobData } from "../queue/check-queue.js";

export interface TestCheckQueue {
  queue: Queue<CheckJobData>;
  enqueueCheck: (monitorId: string) => Promise<void>;
  close: () => Promise<void>;
}

// Eigene Redis-Verbindung pro Test statt der geteilten App-Singleton -
// spricht dieselbe "checks"-Queue in Redis an (Queues sind namensbasiert),
// laesst sich aber unabhaengig schliessen, damit der Testprozess sauber endet.
export function createTestCheckQueue(): TestCheckQueue {
  const connection = new Redis({
    host: env.redisHost,
    port: env.redisPort,
    maxRetriesPerRequest: null,
  });
  const queue = new Queue<CheckJobData>("checks", { connection });

  return {
    queue,
    enqueueCheck: async (monitorId: string) => {
      await queue.add("run-check", { monitorId });
    },
    close: async () => {
      await queue.close();
      connection.disconnect();
    },
  };
}
