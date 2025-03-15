import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import * as request from 'supertest';
import * as path from 'path';
import * as fs from 'fs';
import { KafkaProducerInterface } from '../../src/infra/providers/kafka/interfaces/kafka-producer.interface';
import { S3Interface } from '../../src/infra/providers/s3/interface/s3.interface';
import { BankSlipModule } from '../../src/modules/upload-bank-slip/upload-bank-slip';
import { DataSourceTestModule } from '../database/data-source-test.module';

describe('Upload Multipart', () => {
  let app: INestApplication;
  let dataSource: DataSource;
  let dataSourceModule: DataSourceTestModule;
  let s3Provider: S3Interface;

  const filename = 'bank-slip.csv';
  const bucketName = 'my-bucket';

  const filePath = path.resolve(__dirname, `../files/${filename}`);

  if (!fs.existsSync(filePath)) {
    throw new Error(`Arquivo de teste não encontrado: ${filePath}`);
  }

  beforeAll(async () => {
    const mockKafkaProvider = {
      onModuleInit: jest.fn(),
      onModuleDestroy: jest.fn(),
      sendMessage: jest.fn(),
    };

    const mockS3Provider = {
      uploadFileInMultipart: jest.fn().mockResolvedValue({
        filename,
        bucketName,
      }),
    };

    const md = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        DataSourceTestModule,
        BankSlipModule,
      ],
    })
      .overrideProvider(KafkaProducerInterface)
      .useValue(mockKafkaProvider)
      .overrideProvider(S3Interface)
      .useValue(mockS3Provider)
      .compile();

    app = md.createNestApplication();
    dataSourceModule = app.get(DataSourceTestModule);
    dataSource = app.get<DataSource>(DataSource);
    s3Provider = app.get<S3Interface>(S3Interface);

    await app.init();
  });

  afterEach(async () => {
    await dataSourceModule.clearDatabase();
  });

  afterAll(async () => await app.close());

  describe('/bank-slip/upload', () => {
    it('Should save file in database when file is upload to S3 bucket successfully', async () => {
      await request(app.getHttpServer())
        .post('/bank-slip/upload')
        .attach('file', filePath)
        .expect(201);

      const result = await dataSource.query(
        'SELECT * FROM "FileUploaded" WHERE file_name = $1',
        [filename],
      );

      expect(result).toHaveLength(1);
      expect(result[0].file_name).toBe(filename);
    });

    it('Should rollback file saved in database when upload to s3 bucket fails', async () => {
      jest
        .spyOn(s3Provider, 'uploadFileInMultipart')
        .mockRejectedValueOnce(new Error('Upload fails'));

      await request(app.getHttpServer())
        .post('/bank-slip/upload')
        .attach('file', filePath)
        .catch((reason) => {
          expect(reason.message).toEqual('Upload fails');
        });

      const result = await dataSource.query(
        'SELECT * FROM "FileUploaded" WHERE file_name = $1',
        [filename],
      );

      expect(result).toHaveLength(0);
    });
  });
});
