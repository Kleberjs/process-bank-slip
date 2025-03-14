import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Consumer, ConsumerRunConfig, Kafka, logLevel } from 'kafkajs';

@Injectable()
export class KafkaConsumerGenerateBankSlipProvider
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger: Logger = new Logger(
    KafkaConsumerGenerateBankSlipProvider.name,
  );
  private kafka: Kafka;
  private consumer: Consumer;

  async onModuleInit() {
    this.kafka = new Kafka({
      clientId: 'ms-api-file',
      brokers: ['localhost:9092'],
      retry: { retries: 10 },
      logLevel: logLevel.ERROR,
      connectionTimeout: 3000,
    });

    this.consumer = this.kafka.consumer({ groupId: 'generate-bank-slip' });

    await this.consumer.connect();

    this.logger.log('Kafka Consumer connected');
  }

  async onModuleDestroy() {
    if (this.consumer) {
      await this.consumer.disconnect();
      this.logger.log('Kafka Producer disconnected');
    }
  }

  async consume(topics: string[], config: ConsumerRunConfig) {
    try {
      this.logger.log(`Trying subscribe to topic: ${JSON.stringify(topics)}`);
      await this.consumer.subscribe({ topics });

      await this.consumer.run(config);

      this.logger.log(`Consumers start for topics: ${topics.join(',')}`);
    } catch (error) {
      this.logger.error(
        `Error trying sending message to kafka: ${error?.message}`,
      );
    }
  }
}
