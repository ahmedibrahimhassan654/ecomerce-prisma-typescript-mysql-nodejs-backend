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
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const ErrorResponse_1 = __importDefault(require("../exceptions/ErrorResponse"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
const authenticate = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return next(new ErrorResponse_1.default("Unauthorized: No token provided", 401));
    }
    const token = authHeader.split(" ")[1];
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Convert userId to a number
        const userId = parseInt(decoded.userId, 10);
        // Find user by ID from the token payload
        const user = yield prisma.user.findUnique({ where: { id: userId } });
        if (!user) {
            return next(new ErrorResponse_1.default("Unauthorized: User not found", 401));
        }
        // Attach user to the request object
        req.user = user;
        next();
    }
    catch (error) {
        return next(new ErrorResponse_1.default("Unauthorized: Invalid token", 401));
    }
});
exports.authenticate = authenticate;
