import { Test, TestingModule } from '@nestjs/testing';
import { KafkaProvider } from '../../../infra/providers/kafka/kafka.provider';
import { S3Provider } from '../../../infra/providers/s3/s3.provider';
import { FileUploadedRepository } from '../database/file-uploaded.repository';
import { UploadBankSlipService } from './upload-bank-slip.service';
import { FileUploaded } from '../database/file-uploaded.orm-entity';

describe('UploadBankSlipService', () => {
  let service: UploadBankSlipService;
  let repository: FileUploadedRepository;
  let s3Provider: S3Provider;
  let kafkaProvider: KafkaProvider;

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
        UploadBankSlipService,
        {
          provide: FileUploadedRepository,
          useValue: {
            findFileHashed: jest.fn(),
            createFileHashed: jest.fn(),
          },
        },
        {
          provide: S3Provider,
          useValue: {
            uploadFile: jest.fn().mockResolvedValue({
              filename: file.originalname,
              bucketName: 'my-bucket',
            }),
          },
        },
        {
          provide: KafkaProvider,
          useValue: {
            sendMessage: jest.fn(),
          },
        },
      ],
    }).compile();

    service = md.get<UploadBankSlipService>(UploadBankSlipService);
    repository = md.get<FileUploadedRepository>(FileUploadedRepository);
    s3Provider = md.get<S3Provider>(S3Provider);
    kafkaProvider = md.get<KafkaProvider>(KafkaProvider);
  });

  afterEach(jest.clearAllMocks);

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Should throw error when header is wrong', async () => {
    const fileMocked = {
      ...file,
      buffer: Buffer.from('name,governmentId,email,debtAmount,debtDueDate'),
    };

    await expect(service.execute(fileMocked)).rejects.toThrow();
  });

  it('Should throw error when file already exist in database', async () => {
    jest.spyOn(repository, 'findFileHashed').mockResolvedValueOnce({
      id: 1,
      filename: 'test-file.csv',
      fileHashed: '9333f987e62bbd4b522b7246119ab945',
    } as FileUploaded);

    await expect(service.execute(file)).rejects.toThrow();
  });

  it('Should upload file susscessfully', async () => {
    const spyUploadFile = jest.spyOn(s3Provider, 'uploadFile');
    const spyKafkaProvider = jest.spyOn(kafkaProvider, 'sendMessage');

    await service.execute(file);

    expect(spyUploadFile).toHaveBeenCalledWith(file.buffer, file.originalname);
    expect(spyKafkaProvider).toHaveBeenCalledWith('bank-slip-uploaded', {
      filename: file.originalname,
      bucketName: 'my-bucket',
    });
  });
});
