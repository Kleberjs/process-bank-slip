import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DataSource } from 'typeorm';
import { KafkaInterface } from '../src/infra/providers/kafka/interface/kafka.interface';
import { S3Interface } from '../src/infra/providers/s3/interface/s3.interface';
import { BankSlipModule } from '../src/modules/bank-slip/bank-slip.module';
import { DataSourceTestModule } from './data-source-test.module';
import * as request from 'supertest';
import * as path from 'path';
import * as fs from 'fs';

describe('Upload Multipart (e2e)', () => {
  let appTest: INestApplication;
  let dataSource: DataSource;
  let dataSourceModule: DataSourceTestModule;

  beforeAll(async () => {
    const mockKafkaProvider = {
      onModuleInit: jest.fn(),
      onModuleDestroy: jest.fn(),
      sendMessage: jest.fn(),
    };

    const mockS3Provider = {
      uploadFileInMultipart: jest.fn().mockResolvedValue({
        filename: 'sample.txt',
        bucketName: 'my-bucket',
      }),
    };

    const md = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        DataSourceTestModule,
        BankSlipModule,
      ],
    })
      .overrideProvider(KafkaInterface)
      .useValue(mockKafkaProvider)
      .overrideProvider(S3Interface)
      .useValue(mockS3Provider)
      .compile();

    appTest = md.createNestApplication();
    dataSourceModule = appTest.get(DataSourceTestModule);
    dataSource = appTest.get(DataSource);
    await appTest.init();
  });

  afterAll(async () => {
    await dataSourceModule.clearDatabase();
    await appTest.close();
  });

  it('deve realizar upload de arquivo multipart para o S3', async () => {
    const filePath = path.resolve(__dirname, './files/sample.csv');

    if (!fs.existsSync(filePath)) {
      throw new Error(`Arquivo de teste não encontrado: ${filePath}`);
    }

    await request(appTest.getHttpServer())
      .post('/bank-slip/upload')
      .attach('file', filePath)
      .expect(201);

    const result = await dataSource.query(
      'SELECT * FROM "FileUploaded" WHERE file_name = $1',
      ['sample.csv'],
    );

    expect(result).toHaveLength(1);
    expect(result[0].file_name).toBe('sample.csv');
  });
});
