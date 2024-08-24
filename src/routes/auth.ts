import { Router } from "express";
import { login } from "../controllers/authController";

const authRoutes = Router();

authRoutes.get("/login", login);


export default authRoutes;
