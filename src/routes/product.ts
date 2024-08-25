import { Router } from "express";
import {
  createProduct,
  getProductById,
  getProducts,
  deleteProduct,
  updateProduct,
} from "../controllers/productController";

import { loginSchema, signupSchema } from "../utils/validationSchemas";
import { validateSignup, validateLogin } from "../middelwares/validateRequest";
import { authenticate } from "../middelwares/auth";
import { authorize } from "../middelwares/roleMiddleware";
const productsRoute = Router();

// productsRote.get("/login", login);
productsRoute.post("/", authenticate, authorize(["ADMIN"]), createProduct);
productsRoute.get("/", authenticate, getProducts);
productsRoute.get("/:id", authenticate, getProductById);

productsRoute.put("/:id", authenticate, authorize(["ADMIN"]), updateProduct);
productsRoute.delete("/:id", authenticate, authorize(["ADMIN"]), deleteProduct);
export default productsRoute;
