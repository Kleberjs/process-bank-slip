import { Test, TestingModule } from '@nestjs/testing';
import { UploadBankSlipsController } from './upload-bank-slip.controller';
import { UploadBankSlipService } from './upload-bank-slip.service';
import { FileUploadedRepository } from '../database/file-uploaded.repository';
import { ConfigService } from '@nestjs/config';
import { KafkaProducerInterface } from '../../infra/providers/kafka/interfaces/kafka-producer.interface';
import { S3Interface } from '../../infra/providers/s3/interface/s3.interface';

describe('UploadBankSlipController', () => {
  let controller: UploadBankSlipsController;
  let service: UploadBankSlipService;

  const file = {
    fieldname: 'file',
    originalname: 'test-file.csv',
    mimetype: 'text/csv',
    buffer: Buffer.from(
      'name,governmentId,email,debtAmount,debtDueDate,debtId\nJohn Doe,11111111111,johndoe@kanastra.com.br,1000000.00,2022-10-12,1adb6ccf-ff16-467f-bea7-5f05d494280f',
    ),
    size: 1024,
  } as Express.Multer.File;

  beforeAll(async () => {
    const md: TestingModule = await Test.createTestingModule({
      providers: [
        UploadBankSlipsController,
        UploadBankSlipService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('bucketName'),
          },
        },
        {
          provide: FileUploadedRepository,
          useValue: {
            createAtomicTransaction: jest.fn().mockResolvedValue({
              commitTransaction: jest.fn(),
              release: jest.fn(),
              rollbackTransaction: jest.fn(),
            }),
            findFileHashed: jest.fn(),
            createFileHashed: jest.fn(),
          },
        },
        {
          provide: S3Interface,
          useValue: {
            uploadFileInMultipart: jest.fn().mockResolvedValue({
              filename: file.originalname,
              bucketName: 'my-bucket',
            }),
          },
        },
        {
          provide: KafkaProducerInterface,
          useValue: {
            sendMessage: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = md.get<UploadBankSlipsController>(UploadBankSlipsController);
    service = md.get<UploadBankSlipService>(UploadBankSlipService);
  });

  it('Should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('Should throw error service cant process', async () => {
    const serviceSpy = jest.spyOn(service, 'execute');
    const fileMocked = {
      ...file,
      buffer: Buffer.from('name,governmentId'),
    };

    try {
      await controller.uploadBankSlip(fileMocked);
      expect(serviceSpy).toHaveBeenCalledWith(fileMocked);
    } catch (error) {
      expect(error.statusCode).toEqual(400);
      expect(error.message).toEqual('Erro no arquivo csv');
      expect(error.details).toEqual('Deve possuir o tamanho: 6');
    }
  });

  it('Should be called successfully', async () => {
    const serviceSpy = jest.spyOn(service, 'execute');
    const result = await controller.uploadBankSlip(file);

    expect(serviceSpy).toHaveBeenCalledWith(file);
    expect(result.statusCode).toEqual(201);
    expect(result.success).toEqual(true);
  });
});
