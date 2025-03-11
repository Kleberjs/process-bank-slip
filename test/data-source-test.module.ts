import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST_TEST'),
        username: configService.get<string>('DB_USER_TEST'),
        password: configService.get<string>('DB_PWD_TEST'),
        database: configService.get<string>('DB_NAME_TEST'),
        port: configService.get<number>('DB_PORT_TEST'),
        entities: [`${__dirname}/../../modules/**/*.orm-entity.{ts,js}`],
        synchronize: true,
        autoLoadEntities: true,
      }),
    }),
  ],
  exports: [TypeOrmModule],
})
export class DataSourceTestModule {
  constructor(private readonly dataSource: DataSource) {}

  async clearDatabase() {
    await this.dataSource.query(
      'TRUNCATE TABLE "FileUploaded" RESTART IDENTITY CASCADE',
    );
  }
}
