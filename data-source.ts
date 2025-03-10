import { DataSource, DataSourceOptions } from 'typeorm';
import 'dotenv/config';

console.log(`${__dirname}/**/migrations/*.{js,ts}}`);

export const dbConfig = {
  type: 'postgres',
  host: process.env.DB_HOST,
  username: process.env.DB_USER,
  password: process.env.DB_PWD,
  database: process.env.DB_NAME,
  port: 5432,
  migrations: ['dist/src/infra/database/migrations/*.js'],
  logging: true,
} as DataSourceOptions;

export const appDataSource = new DataSource(dbConfig);
