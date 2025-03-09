import { Module } from '@nestjs/common';
import { BankSlipModule } from './modules/bank-slip/bank-slip.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { dbConfig } from './infra/database/data-source';
import { KafkaProvider } from './infra/providers/kafka/kafka.provider';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => dbConfig,
    }),
    BankSlipModule,
  ],
  controllers: [],
  providers: [KafkaProvider],
  exports: [KafkaProvider],
})
export class AppModule {}
