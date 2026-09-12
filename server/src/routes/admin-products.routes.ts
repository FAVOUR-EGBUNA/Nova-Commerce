import { Router } from "express";

import {
  createAdminProduct,
  deleteAdminProduct,
  getAdminProducts,
  updateAdminProduct,
} from "../controllers/admin-products.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";

const router = Router();

router.use(authenticate, requireAdmin);

router.get("/", getAdminProducts);

router.post("/", createAdminProduct);

router.patch("/:productId", updateAdminProduct);

router.delete("/:productId", deleteAdminProduct);

export default router;
