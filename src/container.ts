import {
  asFunction,
  asValue,
  createContainer,
  type AwilixContainer,
} from "awilix";
import type { Repository } from "typeorm";
import { AppDataSource } from "./db/data-source.js";
import { Monitor } from "./domain/monitor.entity.js";
import { Check } from "./domain/check.entity.js";
import { Incident } from "./domain/incident.entity.js";

export interface AppCradle {
  dataSource: typeof AppDataSource;
  monitorRepository: Repository<Monitor>;
  checkRepository: Repository<Check>;
  incidentRepository: Repository<Incident>;
}

declare module "@fastify/awilix" {
  // Declaration merging: extends @fastify/awilix's empty Cradle with our own.
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Cradle extends AppCradle {}
}

export function buildContainer(): AwilixContainer<AppCradle> {
  const container = createContainer<AppCradle>();

  container.register({
    dataSource: asValue(AppDataSource),
    monitorRepository: asFunction(({ dataSource }: AppCradle) =>
      dataSource.getRepository(Monitor),
    ).singleton(),
    checkRepository: asFunction(({ dataSource }: AppCradle) =>
      dataSource.getRepository(Check),
    ).singleton(),
    incidentRepository: asFunction(({ dataSource }: AppCradle) =>
      dataSource.getRepository(Incident),
    ).singleton(),
  });

  return container;
}
