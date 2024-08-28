"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.me = exports.login = exports.signup = void 0;
// import { PrismaClient } from "@prisma/client";
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secrets_1 = require("../secrets");
const ErrorResponse_1 = __importDefault(require("../exceptions/ErrorResponse"));
const logger_1 = __importDefault(require("../utils/logger"));
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
const signup = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
        logger_1.default.warn("Signup failed: Missing required fields");
        return next(new ErrorResponse_1.default("Name, email, and password are required", 400));
    }
    try {
        // Check if user already exists
        const existingUser = yield prismaClient_1.default.user.findUnique({ where: { email } });
        if (existingUser) {
            logger_1.default.warn("Signup failed: User already exists");
            return next(new ErrorResponse_1.default("User already exists", 400));
        }
        // Hash the password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        // Create new user
        const newUser = yield prismaClient_1.default.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || "USER",
            },
        });
        // Generate JWT token
        const token = jsonwebtoken_1.default.sign({ userId: newUser.id }, secrets_1.JWT_SECRET, {
            expiresIn: "1h",
        });
        console.log("Signup request received:", req.body);
        res
            .status(201)
            .json({ success: true, message: "User signed up successfully", token });
    }
    catch (error) {
        logger_1.default.error("Signup failed: Internal server error");
        next(error);
    }
});
exports.signup = signup;
const login = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        logger_1.default.warn("Login failed: Missing required fields");
        return next(new ErrorResponse_1.default("Email and password are required", 400));
    }
    try {
        // Find user by email
        const user = yield prismaClient_1.default.user.findUnique({ where: { email } });
        if (!user) {
            logger_1.default.warn("Login failed: Invalid email or password");
            return next(new ErrorResponse_1.default("Invalid email or password", 401));
        }
        // Compare password
        const isPasswordValid = yield bcrypt_1.default.compare(password, user.password);
        if (!isPasswordValid) {
            logger_1.default.warn("Login failed: Invalid email or password");
            return next(new ErrorResponse_1.default("Invalid email or password", 401));
        }
        // Generate JWT
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET, {
            expiresIn: "1h",
        });
        console.log("Login request received:", req.body);
        res.json({
            success: true,
            message: "User logged in successfully",
            user,
            token,
        });
    }
    catch (error) {
        logger_1.default.error("Login failed: Internal server error");
        next(error);
    }
});
exports.login = login;
const me = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const existingUser = yield prismaClient_1.default.user.findFirst({
            where: { id: req.user.id },
        });
        res.json({
            success: true,
            message: "Logged in user information",
            data: req.user,
            user: existingUser,
        });
    }
    catch (error) {
        logger_1.default.error("Fetching user information failed: Internal server error");
        next(error);
    }
});
exports.me = me;
