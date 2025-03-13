import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Consumer, Kafka, logLevel, Producer } from 'kafkajs';
import { KafkaProducerInterface } from './interfaces/kafka-producer.interface';

@Injectable()
export class KafkaProducerProvider
  implements OnModuleInit, OnModuleDestroy, KafkaProducerInterface
{
  private readonly logger: Logger = new Logger(KafkaProducerProvider.name);

  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;

  async onModuleInit() {
    this.kafka = new Kafka({
      clientId: 'ms-api-file',
      brokers: ['localhost:9092'],
      retry: {
        retries: 10,
      },
      logLevel: logLevel.ERROR,
      connectionTimeout: 3000,
    });

    this.producer = this.kafka.producer();

    await this.producer.connect();

    this.logger.log('Kafka Producer connected');
  }

  async onModuleDestroy() {
    if (this.producer) {
      await this.producer.disconnect();
      this.logger.log('Kafka Producer disconnected');
    }
  }

  async sendMessage(topic: string, message: any) {
    try {
      this.logger.log(
        `Sending message - topic: ${topic} - message: ${JSON.stringify(message)}`,
      );
      const record = await this.producer.send({
        topic,
        messages: [{ value: JSON.stringify(message) }],
      });

      this.logger.log(`Record: ${JSON.stringify(record)}`);
    } catch (error) {
      this.logger.error(
        `Error trying sending message to kafka: ${error?.message}`,
      );
    }
  }
}
