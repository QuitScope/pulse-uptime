import type { MigrationInterface, QueryRunner } from "typeorm";

export class CreateCheck1789659593468 implements MigrationInterface {
  name = "CreateCheck1789659593468";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "check" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "http_status" integer, "response_time_ms" integer NOT NULL, "success" boolean NOT NULL, "error_message" character varying, "checked_at" TIMESTAMP NOT NULL DEFAULT now(), "monitor_id" uuid NOT NULL, CONSTRAINT "PK_de2f7a277e891b3342c5b0d2710" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "check" ADD CONSTRAINT "FK_512e4c85ab178d86704ab7210a0" FOREIGN KEY ("monitor_id") REFERENCES "monitor"("id") ON DELETE CASCADE ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "check" DROP CONSTRAINT "FK_512e4c85ab178d86704ab7210a0"`,
    );
    await queryRunner.query(`DROP TABLE "check"`);
  }
}
