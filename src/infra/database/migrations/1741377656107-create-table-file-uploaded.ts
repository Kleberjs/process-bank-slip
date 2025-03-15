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

    await queryRunner.query(`
      CREATE INDEX "idx_file_uploaded_file_name" ON "FileUploaded" ("file_name");
  `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_file_uploaded_file_name";`);

    await queryRunner.query(`DROP TABLE "FileUploaded"`);
  }
}
