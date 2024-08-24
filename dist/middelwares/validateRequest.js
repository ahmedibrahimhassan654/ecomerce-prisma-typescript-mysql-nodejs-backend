"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateLogin = exports.validateSignup = void 0;
const validationSchemas_1 = require("../utils/validationSchemas");
const validateSignup = (req, res, next) => {
    try {
        validationSchemas_1.signupSchema.parse(req.body);
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.validateSignup = validateSignup;
const validateLogin = (req, res, next) => {
    try {
        validationSchemas_1.loginSchema.parse(req.body);
        next();
    }
    catch (error) {
        next(error);
    }
};
exports.validateLogin = validateLogin;
