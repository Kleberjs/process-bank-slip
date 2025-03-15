import { TestingModule, Test } from '@nestjs/testing';
import { KafkaProducerInterface } from '../../infra/providers/kafka/interfaces/kafka-producer.interface';
import { S3Interface } from '../../infra/providers/s3/interface/s3.interface';
import { GetFileS3Service } from './get-file-s3.service';
import { KafkaConsumerGetFileS3Provider } from '../../infra/providers/kafka/kafka-consumer-get-file-s3.provider';
import { BankSlipRepository } from './database/bank-slip.repository';
import { ConfigService } from '@nestjs/config';
import { EachMessagePayload } from 'kafkajs';

describe('GetFileS3Service', () => {
  let service: GetFileS3Service;
  let repository: BankSlipRepository;
  let kafkaProducer: KafkaProducerInterface;

  const bucketName = 'bucketName';
  const payload = {
    topic: 'topic-test',
    partition: 0,
    message: {
      key: null,
      value: Buffer.from(
        JSON.stringify({
          filename: 'nome-arquivo',
          bucketName,
        }),
      ) as Buffer,
    },
  } as unknown as EachMessagePayload;

  const kafkaPayload = {
    name: 'John Doe',
    debtId: '1adb6ccf-ff16-467f-bea7-5f05d494280f',
    email: 'johndoe@kanastra.com.br',
    debtAmount: '1000000.00',
    governmentId: '11111111111',
    debtDueDate: '2022-10-12',
  };

  const s3FileBuffer = Buffer.from(
    'name,governmentId,email,debtAmount,debtDueDate,debtId\nJohn Doe,11111111111,johndoe@kanastra.com.br,1000000.00,2022-10-12,1adb6ccf-ff16-467f-bea7-5f05d494280f',
  );

  beforeAll(async () => {
    const md: TestingModule = await Test.createTestingModule({
      providers: [
        GetFileS3Service,
        {
          provide: BankSlipRepository,
          useValue: {
            getBankSlipProcessed: jest.fn(),
            saveBankSlip: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(bucketName),
          },
        },
        {
          provide: S3Interface,
          useValue: {
            getFileFromS3: jest.fn().mockResolvedValue({ Body: s3FileBuffer }),
          },
        },
        {
          provide: KafkaProducerInterface,
          useValue: {
            sendMessage: jest.fn(),
          },
        },
        {
          provide: KafkaConsumerGetFileS3Provider,
          useValue: {
            consume: jest.fn(),
          },
        },
      ],
    }).compile();

    service = md.get<GetFileS3Service>(GetFileS3Service);
    repository = md.get<BankSlipRepository>(BankSlipRepository);
    kafkaProducer = md.get<KafkaProducerInterface>(KafkaProducerInterface);
  });

  afterEach(jest.clearAllMocks);

  it('Should be defined', () => {
    expect(service).toBeDefined();
  });

  it('Should throw error when filename is not in message', async () => {
    const payloadMock = {
      ...payload,
      message: {
        ...payload.message,
        value: Buffer.from(JSON.stringify({ bucketName: 'bucket-name' })),
      },
    } as unknown as EachMessagePayload;

    await expect(service.execute(payloadMock)).rejects.toThrow(
      new Error('Não existe informações na mensagem'),
    );
  });

  it('Should send event to kafka queue', async () => {
    const spyKafkaProducer = jest.spyOn(kafkaProducer, 'sendMessage');

    await service.execute(payload);

    expect(spyKafkaProducer).toHaveBeenCalledWith(bucketName, kafkaPayload);
  });

  it('Should not send event to kafka queue when already generate pdf and send email', async () => {
    jest.spyOn(repository, 'getBankSlipProcessed').mockResolvedValueOnce(1);

    const spyKafkaProducer = jest.spyOn(kafkaProducer, 'sendMessage');

    await service.execute(payload);

    expect(spyKafkaProducer).not.toHaveBeenCalled();
  });
});
