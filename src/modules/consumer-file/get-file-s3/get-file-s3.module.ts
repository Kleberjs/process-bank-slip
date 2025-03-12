import { Module } from '@nestjs/common';
import { S3Interface } from '../../../infra/providers/s3/interface/s3.interface';
import { S3Provider } from '../../../infra/providers/s3/s3.provider';
import { KafkaProducerInterface } from '../../../infra/providers/kafka/interfaces/kafka-producer.interface';
import { KafkaProducerProvider } from '../../../infra/providers/kafka/kafka-producer.provider';

@Module({
  providers: [
    { provide: KafkaProducerInterface, useClass: KafkaProducerProvider },
    { provide: S3Interface, useClass: S3Provider },
  ],
})
export class GetFileS3Module {}
