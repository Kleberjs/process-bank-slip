export class KafkaMessageDto {
  filename: string;
  bucketName: string;
}

export abstract class KafkaInterface {
  abstract sendMessage(topic: string, message: KafkaMessageDto): Promise<void>;
}
