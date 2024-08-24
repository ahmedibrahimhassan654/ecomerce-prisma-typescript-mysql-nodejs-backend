"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// src/utils/ErrorResponse.ts
class ErrorResponse extends Error {
    constructor(message, statusCode, errorCode, error) {
        super(message);
        this.statusCode = statusCode;
        this.errorCode = errorCode;
        this.error = error;
        Error.captureStackTrace(this, this.constructor);
    }
}
exports.default = ErrorResponse;
