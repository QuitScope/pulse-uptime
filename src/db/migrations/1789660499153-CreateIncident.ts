import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreateIncident1789660499153 implements MigrationInterface {
  name = "CreateIncident1789660499153";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "incident" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "started_at" TIMESTAMP NOT NULL, "resolved_at" TIMESTAMP, "monitor_id" uuid NOT NULL, CONSTRAINT "PK_5f90b28b0b8238d89ee8edcf96e" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "incident" ADD CONSTRAINT "FK_1865a2f96ec5a2da4aa9788bd56" FOREIGN KEY ("monitor_id") REFERENCES "monitor"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "incident" DROP CONSTRAINT "FK_1865a2f96ec5a2da4aa9788bd56"`,
    );
    await queryRunner.query(`DROP TABLE "incident"`);
  }
}
