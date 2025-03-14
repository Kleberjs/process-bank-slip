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
    private readonly kafkaConsumer: KafkaConsumerInterface,
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

      let posDebtId: number = 0;
      let posName: number = 0;
      let posEmail: number = 0;
      let posGovId: number = 0;
      let posDebtAmount: number = 0;
      let posDebtDueDate: number = 0;

      let isFirstLine = true;

      for await (const line of readableLine) {
        if (isFirstLine) {
          const headerPosition = this.getPositionHeader(line);

          posDebtId = headerPosition.posDebtId;
          posName = headerPosition.posName;
          posGovId = headerPosition.posGovId;
          posEmail = headerPosition.posEmail;
          posDebtAmount = headerPosition.posDebtAmount;
          posDebtDueDate = headerPosition.posDebtDueDate;

          isFirstLine = false;

          continue;
        }

        const debtId = line.split(',')[posDebtId];

        const fileAlreadyProcessed =
          await this.bankSlipAlreadyProcessed(debtId);

        if (fileAlreadyProcessed) {
          this.logger.warn(
            `Boleto já foi gerado e email já foi enviado - debtId: ${debtId}`,
          );

          return;
        }

        const payload = {
          debtId,
          name: line.split(',')[posName],
          governmentId: line.split(',')[posGovId],
          email: line.split(',')[posEmail],
          debtAmount: line.split(',')[posDebtAmount],
          debtDueDate: line.split(',')[posDebtDueDate],
        };

        await this.saveBankSlipAndEmail(payload);

        await this.kafkaProducer.sendMessage(this.TOPIC_PRODUCER, payload);

        this.logger.log(
          `Enviado para processamento de boleto e envio de email: ${debtId}`,
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

  private getPositionHeader(line: string): {
    posDebtId: number;
    posName: number;
    posGovId: number;
    posEmail: number;
    posDebtAmount: number;
    posDebtDueDate: number;
  } {
    const posDebtId = line.split(',').findIndex((l) => l === 'debtId');
    const posName = line.split(',').findIndex((l) => l === 'name');
    const posGovId = line.split(',').findIndex((l) => l === 'governmentId');
    const posEmail = line.split(',').findIndex((l) => l === 'email');
    const posDebtAmount = line.split(',').findIndex((l) => l === 'debtAmount');
    const posDebtDueDate = line
      .split(',')
      .findIndex((l) => l === 'debtDueDate');

    return {
      posDebtId,
      posName,
      posGovId,
      posEmail,
      posDebtAmount,
      posDebtDueDate,
    };
  }

  private async bankSlipAlreadyProcessed(debtId: string): Promise<boolean> {
    const isAlreadProcced =
      await this.bankSlipRepository.getBankSlipProcessed(debtId);

    return !!isAlreadProcced;
  }

  private async saveBankSlipAndEmail(payload): Promise<void> {
    await this.bankSlipRepository.saveBankSlip(payload);
  }
}
