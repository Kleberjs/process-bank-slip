import { FileUploaded } from './file-uploaded.orm-entity';
import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AppDataSource } from '../../../infra/database/data-source';

@Injectable()
export class FileUploadedRepository extends Repository<FileUploaded> {
  constructor() {
    super(FileUploaded, AppDataSource.createEntityManager());
  }
}
