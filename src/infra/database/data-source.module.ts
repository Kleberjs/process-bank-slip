import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        username: configService.get<string>('DB_USER'),
        password: configService.get<string>('DB_PWD'),
        database: configService.get<string>('DB_NAME'),
        port: configService.get<number>('DB_PORT'),
        entities: [`${__dirname}/../../modules/**/*.orm-entity.{ts,js}`],
        autoLoadEntities: true,
        logging: false,
      }),
    }),
  ],
})
export class DataSourceModule {}
