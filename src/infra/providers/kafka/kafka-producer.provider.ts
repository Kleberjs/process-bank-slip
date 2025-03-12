import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import {
  Consumer,
  EachMessagePayload,
  Kafka,
  logLevel,
  Producer,
} from 'kafkajs';
import { KafkaProducerInterface } from './interfaces/kafka-producer.interface';

@Injectable()
export class KafkaProducerProvider
  implements OnModuleInit, OnModuleDestroy, KafkaProducerInterface
{
  private readonly logger: Logger = new Logger(KafkaProducerProvider.name);
  private readonly TOPIC_FILE = process.env.TOPIC_FILE as string;
  private kafka: Kafka;
  private producer: Producer;
  private consumer: Consumer;

  async onModuleInit() {
    const topic = this.TOPIC_FILE;
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
    this.consumer = this.kafka.consumer({ groupId: 'process-file' });

    await this.producer.connect();

    await this.consumer.subscribe({ topic, fromBeginning: true });

    await this.consumer.run({
      eachMessage: async ({ message }: EachMessagePayload) => {
        return new Promise((resolve) => {
          this.logger.log(`Recebizda mensagem: ${message.value?.toString()}`);
          resolve();
        });
      },
    });

    this.logger.log('Kafka Producer connected');
  }

  async onModuleDestroy() {
    if (this.producer) {
      await this.producer.disconnect();
      this.logger.log('Kafka Producer disconnected');
    }
  }

  async sendMessage(message: any) {
    try {
      const topic = this.TOPIC_FILE;

      await this.producer.send({
        topic,
        messages: [{ value: JSON.stringify(message) }],
      });
    } catch (error) {
      this.logger.error(
        `Error trying sending message to kafka: ${error?.message}`,
      );
    }
  }
}
