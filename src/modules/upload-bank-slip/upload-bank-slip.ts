import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProviderModule } from '../../infra/providers/providers.module';
import { FileUploaded } from '../database/file-uploaded.orm-entity';
import { FileUploadedRepository } from '../database/file-uploaded.repository';
import { UploadBankSlipsController } from './upload-bank-slip.controller';
import { UploadBankSlipService } from './upload-bank-slip.service';

@Module({
  imports: [TypeOrmModule.forFeature([FileUploaded]), ProviderModule],
  controllers: [UploadBankSlipsController],
  providers: [UploadBankSlipService, FileUploadedRepository],
})
export class BankSlipModule {}
