import { Router } from "express";
import {
  createOrder,
  updateOrderStatus,
  getAllOrders,
} from "../controllers/orderController";
import { authenticate, authorize } from "../middelwares/auth";

const orderRoute = Router();

orderRoute.post("/", authenticate, createOrder);
orderRoute.put("/:orderId/status", authenticate, updateOrderStatus);
orderRoute.get("/", authenticate, getAllOrders);

export default orderRoute;
