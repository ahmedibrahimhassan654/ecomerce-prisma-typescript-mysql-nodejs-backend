import { Router } from "express";
import {
  addItemToCart,
  getCart,
  getCartItems,
  deleteCartItem,
} from "../controllers/cartController";
import { authenticate } from "../middelwares/auth";

const cartRoute = Router();

cartRoute.post("/", authenticate, addItemToCart);
cartRoute.get("/", authenticate, getCart);
cartRoute.get("/:cartId/items", authenticate, getCartItems);
// Route to delete a specific item from the cart
cartRoute.delete("/items/:itemId", authenticate, deleteCartItem);
export default cartRoute;
