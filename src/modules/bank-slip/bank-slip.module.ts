import { Module } from '@nestjs/common';
import { UploadBankSlipService } from './upload-bank-slip/upload-bank-slip.service';
import { UploadBankSlipsController } from './upload-bank-slip/upload-bank-slip.controller';
import { FileUploadedRepository } from './database/file-uploaded.repository';
import { S3Provider } from '../../infra/providers/s3/s3.provider';
import { KafkaProvider } from '../../infra/providers/kafka/kafka.provider';
import { FileUploaded } from './database/file-uploaded.orm-entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([FileUploaded])],
  controllers: [UploadBankSlipsController],
  providers: [
    UploadBankSlipService,
    FileUploadedRepository,
    S3Provider,
    KafkaProvider,
  ],
})
export class BankSlipModule {}
