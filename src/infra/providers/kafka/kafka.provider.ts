import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { Kafka, Producer } from 'kafkajs';
import { KafkaInterface } from './interface/kafka.interface';

@Injectable()
export class KafkaProvider
  implements OnModuleInit, OnModuleDestroy, KafkaInterface
{
  private readonly logger: Logger = new Logger(KafkaProvider.name);
  private kafka: Kafka;
  private producer: Producer;

  async onModuleInit() {
    this.kafka = new Kafka({
      clientId: 'ms-api-file',
      brokers: ['localhost:9092'],
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
      await this.producer.send({
        topic,
        messages: [{ value: JSON.stringify(message) }],
      });
    } catch (error) {
      this.logger.error(`Error trying sending message: ${error?.message}`);
    }
  }
}
