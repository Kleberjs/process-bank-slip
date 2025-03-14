import { BankSlip } from '../../../../modules/consumer-file/get-file-s3/database/bank-slip.orm-entity';

export abstract class MailInterface {
  abstract sendMail(payload: BankSlip): Promise<boolean>;
}
