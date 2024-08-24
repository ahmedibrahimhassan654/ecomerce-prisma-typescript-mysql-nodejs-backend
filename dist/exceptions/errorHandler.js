"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const ErrorResponse_1 = __importDefault(require("./ErrorResponse"));
const logger_1 = __importDefault(require("../utils/logger"));
const zod_1 = require("zod");
const errorHandler = (err, req, res, next) => {
    let error = Object.assign({}, err);
    error.message = err.message;
    // Log to console for dev
    logger_1.default.error(`${err.message} - ${req.method} ${req.originalUrl} - ${req.ip}`);
    if (err instanceof zod_1.ZodError) {
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
        error = new ErrorResponse_1.default(message, 400, "DUPLICATE_KEY_ERROR", err);
    }
    // Handle validation errors
    if (err.name === "ValidationError") {
        const message = Object.values(err.errors)
            .map((val) => val.message)
            .join(", ");
        error = new ErrorResponse_1.default(message, 400, "VALIDATION_ERROR", err);
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
exports.default = errorHandler;
