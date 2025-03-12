import { Module } from '@nestjs/common';
import { S3Interface } from './s3/interface/s3.interface';
import { S3Provider } from './s3/s3.provider';
import { KafkaConsumerInterface } from './kafka/interfaces/kafka-consumer.interface';
import { KafkaConsumerProvider } from './kafka/kafka-consumer.provider';

@Module({
  providers: [
    { provide: KafkaConsumerInterface, useClass: KafkaConsumerProvider },
    { provide: S3Interface, useClass: S3Provider },
  ],
  exports: [
    { provide: KafkaConsumerInterface, useClass: KafkaConsumerProvider },
    { provide: S3Interface, useClass: S3Provider },
  ],
})
export class ProviderModule {}
