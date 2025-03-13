export class KafkaSendFileToS3Dto {
  filename: string;
  bucketName: string;
}

export class KafkaProcessBankSlipDto {}

export class KafkaSendBankSlipDto {
  name: string;
  governmentId: string;
  email: string;
  debtAmount: string;
  debtDueDate: string;
  debtId: string;
}

export abstract class KafkaProducerInterface {
  abstract sendMessage(topic: string, message: any): Promise<void>;
}
