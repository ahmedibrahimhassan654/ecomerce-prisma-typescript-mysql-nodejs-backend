import { NextFunction, Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../secrets";
import ErrorResponse from "../exceptions/ErrorResponse";
import logger from "../utils/logger";
const prisma = new PrismaClient();

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, email, password } = req.body;

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
      },
    });

    // Generate JWT token
    const token = jwt.sign({ userId: newUser.id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    logger.info("User created successfully");
    res.status(201).json({ message: "User created successfully", token });
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

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      logger.warn("Login failed: Invalid email or password");
      return next(new ErrorResponse("Invalid email or password", 401));
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    logger.info("Login successful");
    res.status(200).json({ message: "Login successful", token });
  } catch (error) {
    logger.error("Login failed: Internal server error");
    next(error);
  }
};
