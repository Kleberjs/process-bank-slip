import { TestingModule, Test } from '@nestjs/testing';
import { KafkaProducerInterface } from '../../infra/providers/kafka/interfaces/kafka-producer.interface';
import { ConfigService } from '@nestjs/config';
import { EachMessagePayload } from 'kafkajs';
import { KafkaConsumerGenerateBankSlipProvider } from '../../infra/providers/kafka/kafka-consumer-generate-bank-slip.provider';
import { MailInterface } from '../../infra/providers/mail/interface/mail.interface';
import { PDFInterface } from '../../infra/providers/pdf/interface/pdf.interface';
import { GenerateBankSlipService } from './generate-bank-slip.service';
import { BankSlipRepository } from '../get-file-s3/database/bank-slip.repository';
import { BankSlip } from '../get-file-s3/database/bank-slip.orm-entity';

describe('GetFileS3Service', () => {
  let service: GenerateBankSlipService;
  let repository: BankSlipRepository;
  let pdfProvider: PDFInterface;
  let mailProvider: MailInterface;

  const bucketName = 'bucketName';

  const payload = {
    topic: 'topic-test',
    partition: 0,
    message: {
      key: null,
      value: Buffer.from(
        JSON.stringify({
          debtId: '190238120938210-38019381203',
          email: 'email@email.com',
        }),
      ) as Buffer,
    },
  } as unknown as EachMessagePayload;

  const bankSlip = {
    name: 'John Doe',
    debtId: '1adb6ccf-ff16-467f-bea7-5f05d494280f',
    email: 'johndoe@kanastra.com.br',
    debtAmount: '1000000.00',
    governmentId: '11111111111',
    debtDueDate: '2022-10-12',
    bankSlipGenerated: false,
    emailSended: false,
  } as unknown as BankSlip;

  beforeAll(async () => {
    const md: TestingModule = await Test.createTestingModule({
      providers: [
        GenerateBankSlipService,
        {
          provide: BankSlipRepository,
          useValue: {
            getBankSlip: jest.fn().mockResolvedValue(bankSlip),
            updateBankSlip: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(bucketName),
          },
        },
        {
          provide: KafkaProducerInterface,
          useValue: {
            sendMessage: jest.fn(),
          },
        },
        {
          provide: KafkaConsumerGenerateBankSlipProvider,
          useValue: {
            consume: jest.fn(),
          },
        },
        {
          provide: PDFInterface,
          useValue: {
            generatePdf: jest.fn(),
          },
        },
        {
          provide: MailInterface,
          useValue: {
            sendMail: jest.fn(),
          },
        },
      ],
    }).compile();

    service = md.get<GenerateBankSlipService>(GenerateBankSlipService);
    repository = md.get<BankSlipRepository>(BankSlipRepository);
    pdfProvider = md.get<PDFInterface>(PDFInterface);
    mailProvider = md.get<MailInterface>(MailInterface);
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
        value: Buffer.from(JSON.stringify({ email: 'email@email.com' })),
      },
    } as unknown as EachMessagePayload;

    await expect(service.execute(payloadMock)).rejects.toThrow(
      new Error('Não existe informações na mensagem'),
    );
  });

  it('Should not generate pdf and not send email when already processed', async () => {
    const pdfSpy = jest.spyOn(pdfProvider, 'generatePdf');
    const maiSpy = jest.spyOn(mailProvider, 'sendMail');

    const payloadMock = {
      ...bankSlip,
      emailSended: true,
      bankSlipGenerated: true,
    };

    jest.spyOn(repository, 'getBankSlip').mockResolvedValueOnce(payloadMock);

    await service.execute(payload);

    expect(pdfSpy).not.toHaveBeenCalled();
    expect(maiSpy).not.toHaveBeenCalled();
  });

  it('Should generate pdf and not send email', async () => {
    const pdfSpy = jest.spyOn(pdfProvider, 'generatePdf');
    const maiSpy = jest.spyOn(mailProvider, 'sendMail');
    const updateBankSlipSpy = jest.spyOn(repository, 'updateBankSlip');

    const payloadMock = {
      ...bankSlip,
      emailSended: true,
      bankSlipGenerated: false,
    };

    jest.spyOn(repository, 'getBankSlip').mockResolvedValueOnce(payloadMock);

    await service.execute(payload);

    expect(pdfSpy).toHaveBeenCalledWith(payloadMock);
    expect(maiSpy).not.toHaveBeenCalled();
    expect(updateBankSlipSpy).toHaveBeenCalledWith({
      ...payloadMock,
      bankSlipGenerated: true,
    });
  });

  it('Should not generate pdf and send email', async () => {
    const pdfSpy = jest.spyOn(pdfProvider, 'generatePdf');
    const maiSpy = jest.spyOn(mailProvider, 'sendMail');
    const updateBankSlipSpy = jest.spyOn(repository, 'updateBankSlip');

    const payloadMock = {
      ...bankSlip,
      emailSended: false,
      bankSlipGenerated: true,
    };

    jest.spyOn(repository, 'getBankSlip').mockResolvedValueOnce(payloadMock);

    await service.execute(payload);

    expect(pdfSpy).not.toHaveBeenCalled();
    expect(maiSpy).toHaveBeenCalledWith(payloadMock);
    expect(updateBankSlipSpy).toHaveBeenCalledWith({
      ...payloadMock,
      emailSended: true,
    });
  });
});
