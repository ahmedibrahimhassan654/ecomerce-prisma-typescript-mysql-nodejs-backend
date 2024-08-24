// src/utils/ErrorResponse.ts
class ErrorResponse extends Error {
  statusCode: number;
  errorCode?: string;
  error?: any;

  constructor(
    message: string,
    statusCode: number,
    errorCode?: string,
    error?: any
  ) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.error = error;

    Error.captureStackTrace(this, this.constructor);
  }
}

export default ErrorResponse;
