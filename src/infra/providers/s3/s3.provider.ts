import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
import { S3Interface, S3UploadResponseDto } from './interface/s3.interface';

@Injectable()
export class S3Provider implements S3Interface {
  private readonly logger: Logger = new Logger(S3Provider.name);

  private s3Client: S3;

  constructor(private readonly configService: ConfigService) {
    const isLocalStack = this.configService.get<string>('NODE_ENV') === 'local';

    this.s3Client = new S3({
      endpoint: isLocalStack
        ? this.configService.get<string>('S3_ENDPOINT_LOCALSTASK')
        : undefined,
      region: this.configService.get<string>('AWS_REGION'),
      s3ForcePathStyle: isLocalStack,
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY') as string,
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        ) as string,
      },
    });
  }

  public async uploadFileInMultipart(
    fileBuffer: Buffer,
    filename: string,
  ): Promise<S3UploadResponseDto> {
    this.logger.log(
      `Subindo arquivo ${filename} para bucket S3 em Multipart Upload`,
    );

    console.time('TIME-UPLOADING');

    const bucketName = this.configService.get<string>('S3_BUCKET') as string;

    const PART_SIZE = this.transformMegaByteToBytes(5);

    const createParams: AWS.S3.CreateMultipartUploadRequest = {
      Bucket: bucketName,
      Key: filename,
      ContentType: 'text/csv',
    };

    const { UploadId } = await this.s3Client
      .createMultipartUpload(createParams)
      .promise();

    if (!UploadId) throw new Error('Falha ao iniciar Multipart Upload');

    const parts: AWS.S3.CompletedPart[] = [];
    let partNumber = 0;

    try {
      for (let start = 0; start < fileBuffer.length; start += PART_SIZE) {
        partNumber++;

        const chunk = fileBuffer.slice(start, start + PART_SIZE);

        const uploadPartParams: AWS.S3.UploadPartRequest = {
          Bucket: bucketName,
          Key: filename,
          PartNumber: partNumber,
          UploadId,
          Body: chunk,
        };

        const { ETag } = await this.s3Client
          .uploadPart(uploadPartParams)
          .promise();

        // incluir log
        parts.push({ ETag, PartNumber: partNumber });
      }

      const completeParams: AWS.S3.CompleteMultipartUploadRequest = {
        Bucket: bucketName,
        Key: filename,
        UploadId,
        MultipartUpload: { Parts: parts },
      };

      await this.s3Client.completeMultipartUpload(completeParams).promise();
      console.timeEnd('TIME-UPLOADING');

      this.logger.log(`Arquivo ${filename} salvo no bucket S3`);

      return {
        bucketName,
        filename,
      };
    } catch (error) {
      this.logger.error(`Erro no upload multipart: ${JSON.stringify(error)}`);

      await this.s3Client
        .abortMultipartUpload({ Bucket: bucketName, Key: filename, UploadId })
        .promise();

      throw error;
    }
  }

  public async getFileFromS3(filename: string): Promise<any> {
    const bucketName = this.configService.get<string>('S3_BUCKET') as string;

    const params = {
      Bucket: bucketName,
      Key: filename,
    };

    this.logger.log(`Buscando arquivo ${filename} no bucket S3`);

    try {
      const s3Object = await this.s3Client.getObject(params).promise();

      if (!s3Object?.Body) {
        this.logger.error(`Arquivo ${filename} não encontrado`);

        return null;
      }

      this.logger.log(`Arquivo ${filename} encontrado no bucket S3`);

      return s3Object;
    } catch (error) {
      this.logger.error(
        `Erro ao tentar buscar arquivo no bucket S3: ${JSON.stringify(error)}`,
      );

      throw error;
    }
  }

  private transformMegaByteToBytes(valueInMegabytes = 5) {
    const bytes = 1024;

    return valueInMegabytes * bytes * bytes;
  }
}
