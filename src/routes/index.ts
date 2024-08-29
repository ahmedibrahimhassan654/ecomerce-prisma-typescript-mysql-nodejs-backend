import { Router } from "express";
import authRoutes from "./auth";
import productsRoute from "./product";
import usersRoute from "./user";
const rootRouter = Router();

rootRouter.use("/auth", authRoutes);
rootRouter.use("/products", productsRoute);
rootRouter.use("/users", usersRoute);
export default rootRouter;
