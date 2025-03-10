import { Module } from '@nestjs/common';
import { UploadBankSlipService } from './upload-bank-slip/upload-bank-slip.service';
import { UploadBankSlipsController } from './upload-bank-slip/upload-bank-slip.controller';
import { FileUploadedRepository } from './database/file-uploaded.repository';
import { S3Provider } from '../../infra/providers/s3/s3.provider';
import { KafkaProvider } from '../../infra/providers/kafka/kafka.provider';
import { FileUploaded } from './database/file-uploaded.orm-entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { KafkaInterface } from '../../infra/providers/kafka/interface/kafka.interface';
import { S3Inteface } from '../../infra/providers/s3/interface/s3.inteface';

@Module({
  imports: [TypeOrmModule.forFeature([FileUploaded])],
  controllers: [UploadBankSlipsController],
  providers: [
    UploadBankSlipService,
    FileUploadedRepository,
    { provide: S3Inteface, useClass: S3Provider },
    { provide: KafkaInterface, useClass: KafkaProvider },
  ],
})
export class BankSlipModule {}
