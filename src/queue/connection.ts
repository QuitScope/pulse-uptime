import { Redis } from "ioredis";
import { env } from "../config/env.js";

// BullMQ verlangt maxRetriesPerRequest: null fuer Blocking-Commands (z.B. beim Worker).
export const redisConnection = new Redis({
  host: env.redisHost,
  port: env.redisPort,
  maxRetriesPerRequest: null,
});
