import { Router } from "express";

import {
  getAdminDashboard,
  updateOrderStatus,
} from "../controllers/admin.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";

const router = Router();

router.get("/dashboard", authenticate, requireAdmin, getAdminDashboard);

router.patch(
  "/orders/:orderId/status",
  authenticate,
  requireAdmin,
  updateOrderStatus,
);

export default router;
