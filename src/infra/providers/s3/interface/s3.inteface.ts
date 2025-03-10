export class S3UploadResponseDto {
  filename: string;
  bucketName: string;
}

export abstract class S3Inteface {
  abstract uploadFileInMultipart(
    fileBuffer: Buffer,
    filename: string,
  ): Promise<S3UploadResponseDto>;
}
