import { Module } from '@nestjs/common';
import { UploadBankSlipService } from './upload-bank-slip/upload-bank-slip.service';
import { UploadBankSlipsController } from './upload-bank-slip/upload-bank-slip.controller';
import { FileUploadedRepository } from './database/file-uploaded.repository';
import { S3Provider } from '../../infra/providers/s3/s3.provider';
import { KafkaProvider } from '../../infra/providers/kafka/kafka.provider';

@Module({
  controllers: [UploadBankSlipsController],
  providers: [
    UploadBankSlipService,
    FileUploadedRepository,
    S3Provider,
    KafkaProvider,
  ],
})
export class BankSlipModule {}
