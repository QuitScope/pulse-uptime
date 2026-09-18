import type { MigrationInterface, QueryRunner } from "typeorm";

export class FixTimestampTimezones1789661565342 implements MigrationInterface {
  name = "FixTimestampTimezones1789661565342";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "monitor" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "monitor" ADD "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "check" DROP COLUMN "checked_at"`);
    await queryRunner.query(
      `ALTER TABLE "check" ADD "checked_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "incident" DROP COLUMN "started_at"`);
    await queryRunner.query(
      `ALTER TABLE "incident" ADD "started_at" TIMESTAMP WITH TIME ZONE NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "incident" DROP COLUMN "resolved_at"`);
    await queryRunner.query(
      `ALTER TABLE "incident" ADD "resolved_at" TIMESTAMP WITH TIME ZONE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "incident" DROP COLUMN "resolved_at"`);
    await queryRunner.query(
      `ALTER TABLE "incident" ADD "resolved_at" TIMESTAMP`,
    );
    await queryRunner.query(`ALTER TABLE "incident" DROP COLUMN "started_at"`);
    await queryRunner.query(
      `ALTER TABLE "incident" ADD "started_at" TIMESTAMP NOT NULL`,
    );
    await queryRunner.query(`ALTER TABLE "check" DROP COLUMN "checked_at"`);
    await queryRunner.query(
      `ALTER TABLE "check" ADD "checked_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
    await queryRunner.query(`ALTER TABLE "monitor" DROP COLUMN "created_at"`);
    await queryRunner.query(
      `ALTER TABLE "monitor" ADD "created_at" TIMESTAMP NOT NULL DEFAULT now()`,
    );
  }
}
