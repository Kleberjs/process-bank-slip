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

  async getBankSlip(debtyId: string): Promise<BankSlip | null> {
    return this.repository.findOne({ where: { debtyId: debtyId } });
  }

  async getBankSlipProcessed(debtyId: string): Promise<number> {
    try {
      return this.repository.count({
        where: {
          debtyId,
          emailSended: true,
          bankSlipGenerated: true,
        },
      });
    } catch (error) {
      this.logger.error(`Error database: ${JSON.stringify(error)}`);

      throw error;
    }
  }

  async saveBankSlip(payload: {
    debtyId: string;
    email: string;
  }): Promise<void> {
    try {
      const dto = {
        debtyId: payload.debtyId,
        email: payload.email,
      };

      await this.repository.save(dto);
    } catch (error) {
      this.logger.error(`Error database: ${JSON.stringify(error)}`);

      throw error;
    }
  }
}
