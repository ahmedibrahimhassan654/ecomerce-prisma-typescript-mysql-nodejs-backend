import { Router } from "express";
import {
  createAddress,
  deleteAddress,
  getAddress,
  updateAddress,
  getMyAddresses,
} from "../controllers/userController";

import { authenticate, authorize } from "../middelwares/auth";
const usersRoute = Router();


usersRoute.post("/address", authenticate, createAddress);
usersRoute.delete("/address/:id", authenticate, deleteAddress);
usersRoute.get("/address/:id", authenticate, getAddress);
usersRoute.get("/my-addresses", authenticate, getMyAddresses);
usersRoute.put("/address/:id", authenticate, updateAddress);
export default usersRoute;
