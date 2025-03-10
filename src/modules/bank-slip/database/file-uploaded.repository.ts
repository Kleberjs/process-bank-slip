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

  async findFileHashed(fileHashed: string) {
    return this.repository.findOne({ where: { fileHashed } });
  }

  async createFileHashed(file: Express.Multer.File, fileHashed: string) {
    const dto = this.repository.create({
      filename: file.originalname,
      fileHashed,
    });

    await this.repository.save(dto);
  }
}
