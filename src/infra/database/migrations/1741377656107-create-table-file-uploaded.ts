import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateTableFileUploaded1741377656107
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
        CREATE TABLE "FileUploaded" (
            "id" SERIAL PRIMARY KEY,
            "file_name" VARCHAR(255) NOT NULL,
            "file_hashed" VARCHAR(255) NOT NULL,
            "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "FileUploaded"`);
  }
}
