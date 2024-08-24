import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";

import logger from "../utils/logger";
import ErrorResponse from "../exceptions/ErrorResponse";
import { loginSchema, signupSchema } from "../utils/validationSchemas";

export const validateSignup = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    signupSchema.parse(req.body);
    next();
  } catch (error) {
    next(error);
  }
};

export const validateLogin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    loginSchema.parse(req.body);
    next();
  } catch (error) {
    next(error);
  }
};
