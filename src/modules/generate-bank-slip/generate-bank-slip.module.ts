import { Module } from '@nestjs/common';
import { ProviderModule } from '../../infra/providers/providers.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GenerateBankSlipService } from './generate-bank-slip.service';
import { BankSlip } from '../get-file-s3/database/bank-slip.orm-entity';
import { BankSlipRepository } from '../get-file-s3/database/bank-slip.repository';

@Module({
  imports: [ProviderModule, TypeOrmModule.forFeature([BankSlip])],
  providers: [BankSlipRepository, GenerateBankSlipService],
})
export class GenerateBankSlipModule {}
