import { BankSlip } from '../../../../modules/consumer-file/get-file-s3/database/bank-slip.orm-entity';

export abstract class PDFInterface {
  abstract generatePdf(payload: BankSlip): Promise<boolean>;
}
