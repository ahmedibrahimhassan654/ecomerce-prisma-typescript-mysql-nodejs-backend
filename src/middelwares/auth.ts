import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secrets";
import ErrorResponse from "../exceptions/ErrorResponse";
import prisma from "../utils/prismaClient";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    role: string;
  };
}

export const authorize = (allowedRoles: string[]) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const user = req.user;

    if (!user || !user.userId) {
      console.log("No user found. Access denied.");
      return next(new ErrorResponse("Access denied", 403));
    }

    try {
      const completeUser = await prisma.user.findUnique({
        where: { id: user.userId },
      });

      if (!completeUser || !completeUser.role) {
        console.log("User data not found. Access denied.");
        return next(new ErrorResponse("Access denied", 403));
      }

      if (!allowedRoles.includes(completeUser.role)) {
        console.log(
          `User role (${completeUser.role}) not allowed. Access denied.`
        );
        return next(new ErrorResponse("Access denied", 403));
      }

      // User has the required role; proceed to the next middleware/controller
      return next();
    } catch (error) {
      console.error("Error fetching user data:", error);
      return next(new ErrorResponse("Access denied", 403));
    }
  };
};
export const authenticate = (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return next(new ErrorResponse("No token provided", 401));
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: number;
      role: string;
    };
    req.user = decoded;
    console.log("Decoded user:from authonticate ", req.user);

    next();
  } catch (error) {
    return next(new ErrorResponse("Invalid token", 401));
  }
};
