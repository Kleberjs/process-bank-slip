export class KafkaMessageDto {
  filename: string;
  bucketName: string;
}

export abstract class KafkaConsumerInterface {
  abstract sendMessage(message: KafkaMessageDto): Promise<void>;
}
