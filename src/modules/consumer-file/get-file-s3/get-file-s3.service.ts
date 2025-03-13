import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { KafkaConsumerInterface } from '../../../infra/providers/kafka/interfaces/kafka-consumer.interface';
import { EachMessagePayload } from 'kafkajs';
import { S3Interface } from '../../../infra/providers/s3/interface/s3.interface';
import { Readable } from 'stream';
import * as readline from 'readline';
import {
  KafkaProducerInterface,
  KafkaSendFileToS3Dto,
} from '../../../infra/providers/kafka/interfaces/kafka-producer.interface';
import { BankSlipRepository } from './database/bank-slip.repository';

@Injectable()
export class GetFileS3Service {
  private readonly logger: Logger = new Logger(GetFileS3Service.name);

  private TOPIC_CONSUMER: string;
  private TOPIC_PRODUCER: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly s3Provider: S3Interface,
    private readonly kafkaProducer: KafkaProducerInterface,
    private kafkaConsumer: KafkaConsumerInterface,
    private readonly bankSlipRepository: BankSlipRepository,
  ) {
    this.TOPIC_CONSUMER = this.configService.get<string>(
      'KAFKA_TOPIC_FILE_UPLOAD',
    ) as string;

    this.TOPIC_PRODUCER = this.configService.get<string>(
      'KAFKA_TOPIC_BANK_SLIP',
    ) as string;
  }

  async onApplicationBootstrap() {
    const topics = this.TOPIC_CONSUMER ? this.TOPIC_CONSUMER.split(',') : [];

    await this.kafkaConsumer.consume(topics, {
      eachMessage: async (message: EachMessagePayload) => {
        await this.execute(message);
      },
    });
  }

  async execute(payload: EachMessagePayload) {
    try {
      const messageValue = this.mountValidValueOrThrow(payload);

      const { filename } = messageValue;

      const { Body } = await this.s3Provider.getFileFromS3(filename);

      if (!Body) {
        this.logger.warn(`Arquivo ${filename} não encontrado`);

        return;
      }

      const stream =
        Body instanceof Readable ? Body : Readable.from(Body as Buffer);

      const readableLine = readline.createInterface({ input: stream });

      let posEmail: number = 0;
      let posDebtyId: number = 0;
      let isFirstLine = true;

      for await (const line of readableLine) {
        if (isFirstLine) {
          posDebtyId = line.split(',').findIndex((l) => l === 'debtId');

          posEmail = line.split(',').findIndex((l) => l === 'email');

          isFirstLine = false;
          continue;
        }

        const debtyId = line.split(',')[posDebtyId];

        const email = line.split(',')[posEmail];

        if (!debtyId || !email) {
          throw Error(`Cabeçalho não encontrado no arquivo: ${filename}`);
        }

        const fileAlreadyProcessed =
          await this.bankSlipAlreadyProcessed(debtyId);

        if (fileAlreadyProcessed) {
          this.logger.warn(
            `Boleto já foi gerado e email já foi enviado - debtyId: ${debtyId}`,
          );

          return;
        }

        const payload = {
          debtyId,
          email,
        };

        await this.saveBankSlip(payload);

        await this.kafkaProducer.sendMessage(this.TOPIC_PRODUCER, payload);

        this.logger.log(
          `Enviado para processamento de boleto e envio de email: ${debtyId}`,
        );
      }
    } catch (error) {
      this.logger.error(`Erro: ${JSON.stringify(error)}`);

      throw error;
    }
  }

  private mountValidValueOrThrow(
    payload: EachMessagePayload,
  ): KafkaSendFileToS3Dto {
    const value = payload?.message?.value
      ? (JSON.parse(payload?.message?.value.toString()) as KafkaSendFileToS3Dto)
      : null;

    if (!value?.filename) {
      throw new Error(`Não existe informações na mensagem`);
    }

    return value;
  }

  private async bankSlipAlreadyProcessed(debtyId: string): Promise<boolean> {
    const isAlreadProcced =
      await this.bankSlipRepository.getBankSlipProcessed(debtyId);

    return !!isAlreadProcced;
  }

  private async saveBankSlip(payload: {
    debtyId: string;
    email: string;
  }): Promise<void> {
    await this.bankSlipRepository.saveBankSlip(payload);
  }
}
