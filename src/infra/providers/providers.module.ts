import { Module } from '@nestjs/common';
import { KafkaInterface } from './kafka/interface/kafka.interface';
import { KafkaProvider } from './kafka/kafka.provider';
import { S3Interface } from './s3/interface/s3.interface';
import { S3Provider } from './s3/s3.provider';

@Module({
  providers: [
    { provide: KafkaInterface, useClass: KafkaProvider },
    { provide: S3Interface, useClass: S3Provider },
  ],
  exports: [
    { provide: KafkaInterface, useClass: KafkaProvider },
    { provide: S3Interface, useClass: S3Provider },
  ],
})
export class ProviderModule {}
