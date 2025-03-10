import { Module } from '@nestjs/common';
import { BankSlipModule } from './modules/bank-slip/bank-slip.module';
import { ConfigModule } from '@nestjs/config';
import { KafkaProvider } from './infra/providers/kafka/kafka.provider';
import { DataSourceModule } from './infra/database/data-source.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DataSourceModule,
    BankSlipModule,
  ],
  controllers: [],
  providers: [KafkaProvider],
  exports: [KafkaProvider],
})
export class AppModule {}
