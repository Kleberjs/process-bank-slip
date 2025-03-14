import { Injectable, Logger } from '@nestjs/common';
import { KafkaConsumerInterface } from '../../infra/providers/kafka/interfaces/kafka-consumer.interface';
import { ConfigService } from '@nestjs/config';
import { EachMessagePayload } from 'kafkajs';
import { BankSlipRepository } from '../consumer-file/get-file-s3/database/bank-slip.repository';
import { BankSlip } from '../consumer-file/get-file-s3/database/bank-slip.orm-entity';
import { MailInterface } from '../../infra/providers/mail/interface/mail.interface';
import { PDFInterface } from '../../infra/providers/generate-pdf/interface/pdf.interface';

@Injectable()
export class GenerateBankSlipService {
  private readonly logger: Logger = new Logger(GenerateBankSlipService.name);

  private TOPIC_CONSUMER: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly bankSlipRepository: BankSlipRepository,
    private readonly kafkaConsumer: KafkaConsumerInterface,
    private readonly pdfProvider: PDFInterface,
    private readonly mailProvider: MailInterface,
  ) {
    this.TOPIC_CONSUMER = this.configService.get<string>(
      'KAFKA_TOPIC_BANK_SLIP',
    ) as string;
  }

  async onApplicationBootstrap() {
    const topics = this.TOPIC_CONSUMER.split(',');

    await this.kafkaConsumer.consume(topics, {
      eachMessage: async (message: EachMessagePayload) => {
        await this.execute(message);
      },
    });
  }

  async execute(payload: EachMessagePayload): Promise<void> {
    const messageValue = this.mountValidValueOrThrow(payload);
    const { debtId } = messageValue;

    const bankSlip = await this.getBankSlip(debtId);
    const bankSlipToUpdate = { ...bankSlip };

    if (bankSlip?.emailSended && bankSlip?.bankSlipGenerated) {
      this.logger.warn(`Bank slip and email already processed - ${debtId}`);

      return;
    }

    if (!bankSlip.bankSlipGenerated) {
      await this.generateFromBankSlipPdf(bankSlip);

      bankSlipToUpdate.bankSlipGenerated = true;
    }

    if (!bankSlip.emailSended) {
      await this.sendEmailToUser(bankSlip);

      bankSlipToUpdate.emailSended = true;
    }

    await this.updateBankSlip(bankSlipToUpdate);
  }

  private mountValidValueOrThrow(payload: EachMessagePayload): BankSlip {
    const value = payload?.message?.value
      ? (JSON.parse(payload?.message?.value.toString()) as BankSlip)
      : null;

    if (!value?.debtId || !value.email) {
      throw new Error(`Não existe informações na mensagem`);
    }

    return value;
  }

  private async getBankSlip(debtId: string): Promise<BankSlip> {
    const bankSlip = await this.bankSlipRepository.getBankSlip(debtId);

    if (!bankSlip) {
      throw new Error(`BankSlip not exist`);
    }

    return bankSlip;
  }

  private async generateFromBankSlipPdf(payload: BankSlip): Promise<boolean> {
    const generatePdf = await this.pdfProvider.generatePdf(payload);

    return generatePdf;
  }

  private async sendEmailToUser(payload: BankSlip): Promise<boolean> {
    const sendEmail = await this.mailProvider.sendMail(payload);

    return sendEmail;
  }

  private async updateBankSlip(payload: BankSlip): Promise<void> {
    await this.bankSlipRepository.updateBankSlip(payload);
  }
}
