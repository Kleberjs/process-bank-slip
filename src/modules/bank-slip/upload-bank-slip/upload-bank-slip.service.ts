import { Injectable, Logger } from '@nestjs/common';
import { Readable } from 'stream';
import * as csvParser from 'csv-parser';
import { ErrorMessageCsvFile as ErrorCsvFile } from '../../../infra/handlers/error-message-csv-file.error';
import { createHash } from 'crypto';
import { FileUploadedRepository } from '../database/file-uploaded.repository';
import { S3Provider } from '../../../infra/providers/s3/s3.provider';
import { KafkaProvider } from '../../../infra/providers/kafka/kafka.provider';

@Injectable()
export class UploadBankSlipService {
  private readonly logger: Logger = new Logger(UploadBankSlipService.name);
  private readonly VALID_HEADER = [
    'name',
    'governmentId',
    'email',
    'debtAmount',
    'debtDueDate',
    'debtId',
  ];

  constructor(
    private readonly fileUploadRepository: FileUploadedRepository,
    private readonly s3Service: S3Provider,
    private readonly kafkaProvider: KafkaProvider,
  ) {}

  public async execute(file: Express.Multer.File) {
    try {
      this.logger.log(
        `Iniciando processamento do arquivo - ${file.originalname}`,
      );
      await this.validateHeaderFromCsvFile(file);

      const fileHashed = this.genrateHash(file.buffer);

      await this.checkCsvFileAlreadyExistsInDatabase(fileHashed);

      await this.saveCsvFileInDatabase(file, fileHashed);

      this.logger.log(
        `Iniciando upload no bucket para o arquivo: ${file.originalname}`,
      );

      const { filename, bucketName } = await this.s3Service.uploadFile(
        file.buffer,
        file.originalname,
      );

      this.logger.log('Emitindo evento na fila para processamento');

      await this.kafkaProvider.sendMessage('bank-slip-uploaded', {
        filename,
        bucketName,
      });

      this.logger.log(
        `Finalizado processamento do arquivo - ${file.originalname}`,
      );
    } catch (error) {
      this.logger.error(`Erro: ${JSON.stringify(error)}`);
      throw error;
    }
  }

  private async validateHeaderFromCsvFile(
    file: Express.Multer.File,
  ): Promise<void> {
    const header = await this.getHeaderFromCsvFile(file);
    const errorsMessage = this.mountErrorsFromHeader(header);

    if (errorsMessage.length) {
      throw new ErrorCsvFile({
        message: 'Erro no arquivo csv',
        details: errorsMessage.join(' - '),
        statusCode: 400,
      });
    }
  }

  private async getHeaderFromCsvFile(
    file: Express.Multer.File,
  ): Promise<string[]> {
    return new Promise((resolve, reject) => {
      const stream = Readable.from(file.buffer)
        .pipe(csvParser())
        .on('headers', (headers) => {
          stream.destroy();
          resolve(headers);
        })
        .on('error', (err) => {
          reject(err);
        });
    });
  }

  private mountErrorsFromHeader(csvHeader: string[]): string[] {
    const errorsMessage: string[] = [];

    const isValidHeadersLength = csvHeader.length === this.VALID_HEADER.length;
    const isValidHeader = csvHeader.every((header) =>
      this.VALID_HEADER.includes(header),
    );

    if (!isValidHeader) {
      errorsMessage.push(`Deve seguir o modelo: ${this.VALID_HEADER.join()}`);
    }

    if (!isValidHeadersLength) {
      errorsMessage.push(`Deve possuir o tamanho: ${this.VALID_HEADER.length}`);
    }

    return errorsMessage;
  }

  private genrateHash(buffer: Buffer) {
    return createHash('sha256').update(buffer).digest('hex');
  }

  private async checkCsvFileAlreadyExistsInDatabase(
    fileHashed: string,
  ): Promise<void> {
    const fileSaved =
      await this.fileUploadRepository.findFileHashed(fileHashed);

    if (fileSaved) {
      throw new ErrorCsvFile({
        message: 'Erro no arquivo csv',
        details: 'Arquivo CSV já processado',
        statusCode: 422,
      });
    }
  }

  private async saveCsvFileInDatabase(
    file: Express.Multer.File,
    fileHashed: string,
  ): Promise<void> {
    this.logger.log(
      `Salvando arquivo no banco de dados - ${file.originalname}`,
    );
    await this.fileUploadRepository.createFileHashed(file, fileHashed);
  }
}
