export class KafkaSendFileToS3Dto {
  filename: string;
  bucketName: string;
}

export abstract class KafkaProducerInterface {
  abstract sendMessage(topic: string, message: any): Promise<void>;
}
