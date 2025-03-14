import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DataSourceModule } from './infra/database/data-source.module';
import { GetFileS3Module } from './modules/consumer-file/get-file-s3/get-file-s3.module';
import { GenerateBankSlipModule } from './modules/generate-bank-slip/generate-bank-slip.module';
import { BankSlipModule } from './modules/upload-bank-slip/upload-bank-slip';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    DataSourceModule,
    BankSlipModule,
    GetFileS3Module,
    GenerateBankSlipModule,
  ],
  controllers: [],
  exports: [],
})
export class AppModule {}
