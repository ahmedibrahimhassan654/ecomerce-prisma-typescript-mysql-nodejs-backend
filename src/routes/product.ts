import { Router } from "express";
import {
  createProduct,
  getProductById,
  getProducts,
  deleteProduct,
  updateProduct,
} from "../controllers/productController";


import { authenticate, authorize } from "../middelwares/auth";
const productsRoute = Router();

// productsRote.get("/login", login);
productsRoute.post("/", authenticate,authorize(["ADMIN"]), createProduct);
productsRoute.get("/", authenticate, getProducts);
productsRoute.get("/:id", authenticate, getProductById);

productsRoute.put("/:id", authenticate,authorize(["ADMIN"]), updateProduct);
productsRoute.delete("/:id", authenticate,authorize(["ADMIN"]), deleteProduct);
export default productsRoute;
