import { Module } from '@nestjs/common';
import { UploadBankSlipService } from './upload-bank-slip/upload-bank-slip.service';
import { UploadBankSlipsController } from './upload-bank-slip/upload-bank-slip.controller';
import { FileUploadedRepository } from './database/file-uploaded.repository';
import { FileUploaded } from './database/file-uploaded.orm-entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderModule } from '../../infra/providers/providers.module';

@Module({
  imports: [TypeOrmModule.forFeature([FileUploaded]), ProviderModule],
  controllers: [UploadBankSlipsController],
  providers: [UploadBankSlipService, FileUploadedRepository],
})
export class BankSlipModule {}
