import { BankSlip } from '../../../../modules/get-file-s3/database/bank-slip.orm-entity';

export abstract class PDFInterface {
  abstract generatePdf(payload: BankSlip): Promise<boolean>;
}
