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

    console.log("Signup request received:", req.body);
    res
      .status(201)
      .json({ success: true, message: "User signed up successfully" });
  } catch (error) {
    logger.error("Signup failed: Internal server error");
    next(error);
  }
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  console.log("Login request received:", { email, password }); // Debugging log

  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    console.warn("Login failed: User not found"); // Debugging log
    return res
      .status(401)
      .json({ success: false, message: "Invalid email or password" });
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    console.warn("Login failed: Incorrect password"); // Debugging log
    return res
      .status(401)
      .json({ success: false, message: "Invalid email or password" });
  }

  res
    .status(200)
    .json({ success: true, message: "User logged in successfully" });
};
