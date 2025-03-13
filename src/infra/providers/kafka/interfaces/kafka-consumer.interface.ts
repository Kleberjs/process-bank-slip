import { ConsumerRunConfig } from 'kafkajs';

export class KafkaMessageDto {
  filename: string;
  bucketName: string;
}

export abstract class KafkaConsumerInterface {
  abstract consume(topics: string[], config: ConsumerRunConfig): Promise<void>;
}
