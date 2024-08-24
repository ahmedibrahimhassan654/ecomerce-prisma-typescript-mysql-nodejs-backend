import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import ErrorResponse from "../exceptions/ErrorResponse";

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
// Extend the Request type to include the user property
interface AuthenticatedRequest extends Request {
  user?: any;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next(new ErrorResponse("Unauthorized: No token provided", 401));
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
    };

    // Convert userId to a number
    const userId = parseInt(decoded.userId, 10);

    // Find user by ID from the token payload
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return next(new ErrorResponse("Unauthorized: User not found", 401));
    }

    // Attach user to the request object
    req.user = user;
    next();
  } catch (error) {
    return next(new ErrorResponse("Unauthorized: Invalid token", 401));
  }
};
