"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorize = void 0;
const ErrorResponse_1 = __importDefault(require("../exceptions/ErrorResponse"));
const authorize = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return next(new ErrorResponse_1.default("Access denied", 403));
        }
        next();
    };
};
exports.authorize = authorize;
