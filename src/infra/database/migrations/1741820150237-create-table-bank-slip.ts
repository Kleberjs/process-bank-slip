import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableBankSlip1741820150237 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "BankSlip" (
            "id" SERIAL PRIMARY KEY,
            "debt_id" UUID UNIQUE NOT NULL,
            "name" VARCHAR(45) NOT NULL,
            "government_id" INT NOT NULL,
            "email" VARCHAR(100) NOT NULL,
            "debt_amount" INT NOT NULL,
            "debt_due_date" Date NOT NULL,
            "bank_slip_generated" BOOLEAN DEFAULT FALSE,
            "email_sended" BOOLEAN DEFAULT FALSE,
            "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updated_at" TIMESTAMP
        );
    `);

    await queryRunner.query(`
        CREATE INDEX "IDX_debt_id" ON "BankSlip" ("debt_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_debt_id"`);
    await queryRunner.query(`DROP TABLE BankSlip`);
  }
}
