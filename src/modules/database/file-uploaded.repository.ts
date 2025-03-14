import { InjectRepository } from '@nestjs/typeorm';
import { FileUploaded } from './file-uploaded.orm-entity';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';

@Injectable()
export class FileUploadedRepository {
  constructor(
    @InjectRepository(FileUploaded)
    private readonly repository: Repository<FileUploaded>,
  ) {}

  async createAtomicTransaction() {
    const queryRunner = this.repository.manager.connection.createQueryRunner();

    await queryRunner.startTransaction();

    return queryRunner;
  }

  async findFileHashed(fileHashed: string) {
    return this.repository.findOne({ where: { fileHashed } });
  }

  async createFileHashed(
    queryRunner: any,
    file: Express.Multer.File,
    fileHashed: string,
  ) {
    const dto = this.repository.create({
      filename: file.originalname,
      fileHashed,
    });

    await queryRunner.manager.save(dto);
  }
}
