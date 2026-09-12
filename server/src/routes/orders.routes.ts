import { Router } from "express";

import {
  createOrder,
  getMyOrders,
  getOrderByReference,
} from "../controllers/orders.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/", authenticate, createOrder);
router.get("/my", authenticate, getMyOrders);
router.get("/:reference", authenticate, getOrderByReference);

export default router;
