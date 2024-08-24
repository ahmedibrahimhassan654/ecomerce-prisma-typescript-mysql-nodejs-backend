import { Router } from "express";
import { login, me, signup } from "../controllers/authController";

import { loginSchema, signupSchema } from "../utils/validationSchemas";
import { validateSignup, validateLogin } from "../middelwares/validateRequest";
import { authenticate } from "../middelwares/auth";

const authRoutes = Router();

// authRoutes.get("/login", login);
authRoutes.post("/signup", validateSignup, signup);
authRoutes.post("/login", validateLogin, login);
authRoutes.get("/me", authenticate, me);
export default authRoutes;
