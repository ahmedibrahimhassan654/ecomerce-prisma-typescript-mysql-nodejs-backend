import { Router } from "express";
import { login, signup } from "../controllers/authController";

const authRoutes = Router();

// authRoutes.get("/login", login);
authRoutes.post("/signup", signup);
authRoutes.post("/login", login);
export default authRoutes;
