import {
  Controller,
  HttpStatus,
  ParseFilePipeBuilder,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { UploadBankSlipService } from './upload-bank-slip.service';
import { ApiBody, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { FileUploadDto } from '../../../infra/dtos/file-upload.dto';

@Controller('/bank-slip')
@ApiTags('BankSlip')
export class UploadBankSlipsController {
  constructor(private readonly service: UploadBankSlipService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'Arquivos do tipo CSV',
    type: FileUploadDto,
  })
  uploadBankSlip(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addFileTypeValidator({
          fileType: 'csv',
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
  ) {
    return this.service.execute(file);
  }
}
