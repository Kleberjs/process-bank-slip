import { Module } from '@nestjs/common';
import { ProviderModule } from '../../infra/providers/providers.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BankSlip } from '../consumer-file/get-file-s3/database/bank-slip.orm-entity';
import { BankSlipRepository } from '../consumer-file/get-file-s3/database/bank-slip.repository';
import { GenerateBankSlipService } from './generate-bank-slip.service';

@Module({
  imports: [ProviderModule, TypeOrmModule.forFeature([BankSlip])],
  providers: [BankSlipRepository, GenerateBankSlipService],
})
export class GenerateBankSlipModule {}
