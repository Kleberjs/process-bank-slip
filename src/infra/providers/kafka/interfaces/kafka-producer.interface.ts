export class KafkaMessageDto {
  filename: string;
  bucketName: string;
}

export abstract class KafkaProducerInterface {
  abstract sendMessage(message: KafkaMessageDto): Promise<void>;
}
