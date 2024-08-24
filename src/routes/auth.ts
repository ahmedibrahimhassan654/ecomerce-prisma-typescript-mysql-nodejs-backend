import { Router } from "express";
import { login, signup } from "../controllers/authController";

import { loginSchema, signupSchema } from "../utils/validationSchemas";
import { validateSignup, validateLogin } from "../middelwares/validateRequest";

const authRoutes = Router();

// authRoutes.get("/login", login);
authRoutes.post("/signup", validateSignup, signup);
authRoutes.post("/login", validateLogin, login);
export default authRoutes;
