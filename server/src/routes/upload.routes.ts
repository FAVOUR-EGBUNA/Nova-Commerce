import { Router } from "express";

import { uploadProductImage } from "../controllers/upload.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { requireAdmin } from "../middleware/admin.middleware.js";
import { upload } from "../middleware/upload.middleware.js";

const router = Router();

router.post(
  "/product-image",
  authenticate,
  requireAdmin,
  upload.single("image"),
  uploadProductImage,
);

export default router;
