import { Module } from '@nestjs/common';
import { BankSlipModule } from './modules/bank-slip/bank-slip.module';
import { ConfigModule } from '@nestjs/config';
import { DataSourceModule } from './infra/database/data-source.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DataSourceModule,
    BankSlipModule,
  ],
  controllers: [],
  exports: [],
})
export class AppModule {}
