"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const validateRequest_1 = require("../middelwares/validateRequest");
const auth_1 = require("../middelwares/auth");
const authRoutes = (0, express_1.Router)();
// authRoutes.get("/login", login);
authRoutes.post("/signup", validateRequest_1.validateSignup, authController_1.signup);
authRoutes.post("/login", validateRequest_1.validateLogin, authController_1.login);
authRoutes.get("/me", auth_1.authenticate, authController_1.me);
exports.default = authRoutes;
