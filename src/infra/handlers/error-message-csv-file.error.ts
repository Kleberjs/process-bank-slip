export class ErrorMessageCsvFile extends Error {
  public details: string;
  public statusCode: number;
  constructor(error: { message: string; details: string; statusCode: number }) {
    super();
    this.message = error.message;
    this.details = error.details;
    this.statusCode = error.statusCode;
  }
}
