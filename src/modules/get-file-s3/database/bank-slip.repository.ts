import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BankSlip } from './bank-slip.orm-entity';

@Injectable()
export class BankSlipRepository {
  private readonly logger: Logger = new Logger(BankSlipRepository.name);
  constructor(
    @InjectRepository(BankSlip)
    private readonly repository: Repository<BankSlip>,
  ) {}

  async getBankSlip(debtId: string): Promise<BankSlip | null> {
    return this.repository.findOne({ where: { debtId: debtId } });
  }

  async getBankSlipProcessed(debtId: string): Promise<number> {
    try {
      return this.repository.count({
        where: {
          debtId,
          emailSended: true,
          bankSlipGenerated: true,
        },
      });
    } catch (error) {
      this.logger.error(`Error database: ${JSON.stringify(error)}`);

      throw error;
    }
  }

  async saveBankSlip(payload: any): Promise<void> {
    try {
      const dto = {
        debtId: payload.debtId,
        name: payload.name,
        governmentId: payload.governmentId,
        email: payload.email,
        debtAmount: payload.debtAmount,
        debtDueDate: payload.debtDueDate,
      };

      await this.repository.save(dto);
    } catch (error) {
      this.logger.error(`Error database: ${JSON.stringify(error)}`);

      throw error;
    }
  }

  async updateBankSlip(dto: BankSlip): Promise<void> {
    try {
      await this.repository.update(
        {
          debtId: dto.debtId,
        },
        dto,
      );
    } catch (error) {
      this.logger.error(`Error database: ${JSON.stringify(error)}`);

      throw error;
    }
  }
}
