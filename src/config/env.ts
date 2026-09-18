import { loadEnvFile } from "node:process";
import { existsSync } from "node:fs";

if (existsSync(".env")) {
  loadEnvFile(".env");
}

function readEnv(name: string, fallback: string): string {
  return process.env[name] ?? fallback;
}

export const env = {
  postgresHost: readEnv("POSTGRES_HOST", "localhost"),
  postgresPort: Number(readEnv("POSTGRES_PORT", "5432")),
  postgresUser: readEnv("POSTGRES_USER", "pulse"),
  postgresPassword: readEnv("POSTGRES_PASSWORD", "pulse"),
  postgresDb: readEnv("POSTGRES_DB", "pulse"),
  redisHost: readEnv("REDIS_HOST", "localhost"),
  redisPort: Number(readEnv("REDIS_PORT", "6379")),
  logLevel: readEnv("LOG_LEVEL", "info"),
  corsOrigin: readEnv("CORS_ORIGIN", "http://localhost:5173"),
};
