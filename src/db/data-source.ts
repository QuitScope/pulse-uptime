import "reflect-metadata";
import { DataSource } from "typeorm";
import { env } from "../config/env.js";
import { Monitor } from "../domain/monitor.entity.js";
import { Check } from "../domain/check.entity.js";
import { Incident } from "../domain/incident.entity.js";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: env.postgresHost,
  port: env.postgresPort,
  username: env.postgresUser,
  password: env.postgresPassword,
  database: env.postgresDb,
  synchronize: false,
  entities: [Monitor, Check, Incident],
  migrations: ["src/db/migrations/*.ts"],
});
