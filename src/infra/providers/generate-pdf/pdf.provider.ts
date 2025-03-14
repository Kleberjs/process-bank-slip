import { Injectable, Logger } from '@nestjs/common';
import { PDFInterface } from './interface/pdf.interface';
import { BankSlip } from '../../../modules/consumer-file/get-file-s3/database/bank-slip.orm-entity';

@Injectable()
export class PDFProvider implements PDFInterface {
  private readonly logger: Logger = new Logger(PDFProvider.name);

  async generatePdf(payload: BankSlip): Promise<boolean> {
    try {
      this.logger.log(`Simulation generate pdf: ${JSON.stringify(payload)}`);

      return new Promise((resolve) => resolve(true));
    } catch (error) {
      this.logger.error(`Error na geração de PDF ${JSON.stringify(error)}`);

      throw error;
    }
  }
}
