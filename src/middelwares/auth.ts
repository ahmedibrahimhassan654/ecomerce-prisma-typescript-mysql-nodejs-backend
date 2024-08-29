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
export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as { userId: number };

    // Fetch user details from the database, including the role
    const user = await prisma.user.findUnique({
      where: { id: decodedToken.userId },
      select: { id: true, role: true }, // Select only the id and role
    });

    if (!user) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // Add userId and role to the request object
    req.user = { userId: user.id, role: user.role };

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    return res.status(401).json({ error: "Unauthorized" });
  }
};
