export class S3UploadResponseDto {
  filename: string;
  bucketName: string;
}

export abstract class S3Interface {
  abstract uploadFileInMultipart(
    fileBuffer: Buffer,
    filename: string,
  ): Promise<S3UploadResponseDto>;

  abstract getFileFromS3(filename: string): Promise<any>;
}
