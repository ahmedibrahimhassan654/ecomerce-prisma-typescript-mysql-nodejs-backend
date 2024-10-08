import { NextFunction, Request, Response } from "express";
// import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secrets";
import ErrorResponse from "../exceptions/ErrorResponse";
import logger from "../utils/logger";
import prisma from "../utils/prismaClient";

interface AuthenticatedRequest extends Request {
  user?: {
    userId: number;
    role: string;
  };
}

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, email, password, role } = req.body;

  if (!name || !email || !password) {
    logger.warn("Signup failed: Missing required fields");
    return next(
      new ErrorResponse("Name, email, and password are required", 400)
    );
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      logger.warn("Signup failed: User already exists");
      return next(new ErrorResponse("User already exists", 400));
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || "USER",
      },
    });

    // Generate JWT token
    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, {
      expiresIn: "50h",
    });

    console.log("Signup request received:", req.body);
    res
      .status(201)
      .json({ success: true, message: "User signed up successfully", token });
  } catch (error) {
    logger.error("Signup failed: Internal server error");
    next(error);
  }
};

export const login = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { email, password } = req.body;

  if (!email || !password) {
    logger.warn("Login failed: Missing required fields");
    return next(new ErrorResponse("Email and password are required", 400));
  }

  try {
    // Find user by email
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      logger.warn("Login failed: Invalid email or password");
      return next(new ErrorResponse("Invalid email or password", 401));
    }

    // Compare password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logger.warn("Login failed: Invalid email or password");
      return next(new ErrorResponse("Invalid email or password", 401));
    }

    // Generate JWT
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET!, {
      expiresIn: "1h",
    });

    console.log("Login request received:", req.body);
    res.json({
      success: true,
      message: "User logged in successfully",
      user,
      token,
    });
  } catch (error) {
    logger.error("Login failed: Internal server error");
    next(error);
  }
};

export const me = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const existingUser = await prisma.user.findFirst({
      where: { id: req.user.userId },
    });

    res.json({
      success: true,
      message: "Logged in user information",
      data: req.user,
      user: existingUser,
    });
  } catch (error) {
    logger.error("Fetching user information failed: Internal server error");
    next(error);
  }
};
