import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';
import { ErrorMessageCsvFile } from '../handlers/error-message-csv-file.error';

@Catch()
export class GlobalExeptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let statusCode = 500;
    let message = 'Internal server error';
    let details = 'Internal server error';

    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      message = JSON.stringify(exception.getResponse());
    } else if (exception instanceof ErrorMessageCsvFile) {
      statusCode = exception.statusCode;
      message = exception.message;
      details = exception.details;
    }

    response.status(statusCode).json({
      statusCode,
      message,
      details,
    });
  }
}
