import { Router } from "express";
import authRoutes from "./auth";
import productsRoute from "./product";
import usersRoute from "./user";
import cartRoute from "./cart";
import orderRoute from "./order";
const rootRouter = Router();

rootRouter.use("/auth", authRoutes);
rootRouter.use("/products", productsRoute);
rootRouter.use("/users", usersRoute);
rootRouter.use("/cart", cartRoute); // Add cart routes
rootRouter.use("/order", orderRoute); // Add orderRoute

export default rootRouter;
