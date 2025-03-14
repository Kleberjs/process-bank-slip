import { Injectable, Logger } from '@nestjs/common';
import { MailInterface } from './interface/mail.interface';
import { BankSlip } from '../../../modules/get-file-s3/database/bank-slip.orm-entity';

@Injectable()
export class MailProvider implements MailInterface {
  private readonly logger: Logger = new Logger(MailProvider.name);

  async sendMail(payload: BankSlip): Promise<boolean> {
    try {
      this.logger.log(`Simulando envio de email: ${JSON.stringify(payload)}`);

      return new Promise((resolve) => resolve(true));
    } catch (error) {
      this.logger.error(`Error na geração de PDF ${JSON.stringify(error)}`);

      throw error;
    }
  }
}
