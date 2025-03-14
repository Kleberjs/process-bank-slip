import { Module } from '@nestjs/common';
import { S3Interface } from './s3/interface/s3.interface';
import { S3Provider } from './s3/s3.provider';
import { KafkaProducerInterface } from './kafka/interfaces/kafka-producer.interface';
import { KafkaProducerProvider } from './kafka/kafka-producer.provider';
import { PDFInterface } from './pdf/interface/pdf.interface';
import { PDFProvider } from './pdf/pdf.provider';
import { MailInterface } from './mail/interface/mail.interface';
import { MailProvider } from './mail/mail.provider';
import { KafkaConsumerGetFileS3Provider } from './kafka/kafka-consumer-get-file-s3.provider';
import { KafkaConsumerGenerateBankSlipProvider } from './kafka/kafka-consumer-generate-bank-slip.provider';

@Module({
  providers: [
    { provide: KafkaProducerInterface, useClass: KafkaProducerProvider },
    KafkaConsumerGetFileS3Provider,
    KafkaConsumerGenerateBankSlipProvider,
    { provide: S3Interface, useClass: S3Provider },
    { provide: PDFInterface, useClass: PDFProvider },
    { provide: MailInterface, useClass: MailProvider },
  ],
  exports: [
    { provide: KafkaProducerInterface, useClass: KafkaProducerProvider },
    KafkaConsumerGetFileS3Provider,
    KafkaConsumerGenerateBankSlipProvider,
    { provide: S3Interface, useClass: S3Provider },
    { provide: PDFInterface, useClass: PDFProvider },
    { provide: MailInterface, useClass: MailProvider },
  ],
})
export class ProviderModule {}
