import { Injectable } from '@nestjs/common';
import { S3Interface } from '../../../infra/providers/s3/interface/s3.interface';
import { KafkaProducerInterface } from '../../../infra/providers/kafka/interfaces/kafka-producer.interface';

@Injectable()
export class GetFileS3Service {
  constructor(
    private readonly kafkaProvider: KafkaProducerInterface,
    private readonly s3Provider: S3Interface,
  ) {}
}
