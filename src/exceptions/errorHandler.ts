import { Request, Response, NextFunction } from "express";
import ErrorResponse from "./ErrorResponse";
import logger from "../utils/logger";
import { ZodError } from "zod";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log to console for dev
  logger.error(`${err.message} - ${req.method} ${req.originalUrl} - ${req.ip}`);
  if (err instanceof ZodError) {
    return res.status(400).json({
      success: false,
      message: err.errors[0].message,
      statusCode: 400,
      errorCode: "VALIDATION_ERROR",
      error: err.errors,
    });
  }
  // Handle MySQL specific errors
  if (err.code === "ER_DUP_ENTRY") {
    const message = "Duplicate field value entered";
    error = new ErrorResponse(message, 400, "DUPLICATE_KEY_ERROR", err);
  }

  // Handle validation errors
  if (err.name === "ValidationError") {
    const message = Object.values(err.errors)
      .map((val: any) => val.message)
      .join(", ");
    error = new ErrorResponse(message, 400, "VALIDATION_ERROR", err);
  }

  // Default to 500 server error
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || "Server Error",
    statusCode: error.statusCode || 500,
    errorCode: error.errorCode || "SERVER_ERROR",
    error: error.error || err,
  });
};

export default errorHandler;
