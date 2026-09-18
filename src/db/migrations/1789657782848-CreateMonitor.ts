import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreateMonitor1789657782848 implements MigrationInterface {
  name = "CreateMonitor1789657782848";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "monitor" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "url" character varying NOT NULL, "interval_seconds" integer NOT NULL, "expected_status_code" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2206b1127c3617bd63373acba74" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "monitor"`);
  }
}
