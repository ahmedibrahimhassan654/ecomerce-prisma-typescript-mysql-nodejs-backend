import { Router } from "express";
import { signup } from "../controllers/authController";

const authRoutes = Router();

// authRoutes.get("/login", login);
authRoutes.post("/signup", signup);

export default authRoutes;
