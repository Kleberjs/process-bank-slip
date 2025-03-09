import { DataSource, DataSourceOptions } from 'typeorm';
import 'dotenv/config';

export const dbConfig = {
  type: 'postgres',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.DB_NAME,
  port: 5432,
  entities: [`dist/modules/**/database/*.orm-entity{.ts,.js}`],
  migrations: ['dist/infra/database/migrations/*.ts'],
  logging: true,
} as DataSourceOptions;

export const AppDataSource = new DataSource(dbConfig);

AppDataSource.initialize()
  .then(() => console.log('Database initiated'))
  .catch((err) =>
    console.log(`Database initiated with error: ${JSON.stringify(err)}`),
  );
