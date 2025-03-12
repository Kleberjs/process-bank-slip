import { Module } from '@nestjs/common';
import { S3Interface } from './s3/interface/s3.interface';
import { S3Provider } from './s3/s3.provider';
import { KafkaProducerInterface } from './kafka/interfaces/kafka-producer.interface';
import { KafkaProducerProvider } from './kafka/kafka-producer.provider';

@Module({
  providers: [
    { provide: KafkaProducerInterface, useClass: KafkaProducerProvider },
    { provide: S3Interface, useClass: S3Provider },
  ],
  exports: [
    { provide: KafkaProducerInterface, useClass: KafkaProducerProvider },
    { provide: S3Interface, useClass: S3Provider },
  ],
})
export class ProviderModule {}
