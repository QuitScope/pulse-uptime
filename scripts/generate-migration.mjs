import { spawnSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

const name = process.argv[2];

if (!name) {
  console.error("Usage: pnpm migration:generate <Name>");
  process.exit(1);
}

const result = spawnSync(
  process.execPath,
  [
    "--import",
    "tsx",
    "./node_modules/typeorm/cli.js",
    "migration:generate",
    `src/db/migrations/${name}`,
    "-d",
    "src/db/data-source.ts",
  ],
  { encoding: "utf-8" },
);

process.stdout.write(result.stdout ?? "");
process.stderr.write(result.stderr ?? "");

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

const match = result.stdout.match(
  /Migration (.+\.ts) has been generated successfully/,
);

if (!match) {
  console.error(
    "Could not find generated migration path in TypeORM output — skipping import-type fix.",
  );
  process.exit(0);
}

const migrationPath = match[1];
const content = readFileSync(migrationPath, "utf-8");
const fixed = content.replace(
  'import { MigrationInterface, QueryRunner } from "typeorm";',
  'import type { MigrationInterface, QueryRunner } from "typeorm";',
);

if (fixed !== content) {
  writeFileSync(migrationPath, fixed);
  console.log(`Fixed type-only import in ${migrationPath}`);
}
