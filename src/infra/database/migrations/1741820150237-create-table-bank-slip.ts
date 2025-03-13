import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableBankSlip1741820150237 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "BankSlip" (
            "id" SERIAL PRIMARY KEY,
            "debty_id" UUID NOT NULL,
            "bank_slip_generated" BOOLEAN DEFAULT FALSE,
            "email_sended" BOOLEAN DEFAULT FALSE,
            "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP
        );
    `);

    await queryRunner.query(`
        CREATE INDEX "IDX_debty_id" ON "BankSlip" ("debty_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_debty_id"`);
    await queryRunner.query(`DROP TABLE BankSlip`);
  }
}
