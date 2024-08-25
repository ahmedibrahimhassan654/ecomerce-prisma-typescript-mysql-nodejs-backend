import { Router } from "express";
import authRoutes from "./auth";
import productsRoute from "./product";
const rootRouter = Router();

rootRouter.use("/auth", authRoutes);
rootRouter.use("/products", productsRoute);

export default rootRouter;
