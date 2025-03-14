import { Module } from '@nestjs/common';
import { S3Interface } from './s3/interface/s3.interface';
import { S3Provider } from './s3/s3.provider';
import { KafkaProducerInterface } from './kafka/interfaces/kafka-producer.interface';
import { KafkaProducerProvider } from './kafka/kafka-producer.provider';
import { KafkaConsumerInterface } from './kafka/interfaces/kafka-consumer.interface';
import { KafkaConsumerProvider } from './kafka/kafka-consumer.provider';
import { PDFInterface } from './generate-pdf/interface/pdf.interface';
import { PDFProvider } from './generate-pdf/pdf.provider';
import { MailInterface } from './mail/interface/mail.interface';
import { MailProvider } from './mail/mail.provider';

@Module({
  providers: [
    { provide: KafkaProducerInterface, useClass: KafkaProducerProvider },
    { provide: KafkaConsumerInterface, useClass: KafkaConsumerProvider },
    { provide: S3Interface, useClass: S3Provider },
    { provide: PDFInterface, useClass: PDFProvider },
    { provide: MailInterface, useClass: MailProvider },
  ],
  exports: [
    { provide: KafkaProducerInterface, useClass: KafkaProducerProvider },
    { provide: KafkaConsumerInterface, useClass: KafkaConsumerProvider },
    { provide: S3Interface, useClass: S3Provider },
    { provide: PDFInterface, useClass: PDFProvider },
    { provide: MailInterface, useClass: MailProvider },
  ],
})
export class ProviderModule {}
