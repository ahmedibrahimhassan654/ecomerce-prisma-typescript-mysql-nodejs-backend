"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const secrets_1 = require("../secrets");
const ErrorResponse_1 = __importDefault(require("../exceptions/ErrorResponse"));
const authenticate = (req, res, next) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token) {
        return next(new ErrorResponse_1.default("No token provided", 401));
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, secrets_1.JWT_SECRET);
        req.user = decoded;
        next();
    }
    catch (error) {
        return next(new ErrorResponse_1.default("Invalid token", 401));
    }
};
exports.authenticate = authenticate;
