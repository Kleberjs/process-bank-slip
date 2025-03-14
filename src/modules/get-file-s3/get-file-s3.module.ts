import { Module } from '@nestjs/common';
import { GetFileS3Service } from './get-file-s3.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankSlip } from './database/bank-slip.orm-entity';
import { BankSlipRepository } from './database/bank-slip.repository';
import { ProviderModule } from '../../infra/providers/providers.module';

@Module({
  imports: [ProviderModule, TypeOrmModule.forFeature([BankSlip])],
  providers: [GetFileS3Service, BankSlipRepository],
})
export class GetFileS3Module {}
