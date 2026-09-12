import { Router } from "express";

import {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
} from "../controllers/wishlist.controller.js";

import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/", authenticate, getWishlist);

router.post(
  "/:productId",
  authenticate,
  addToWishlist,
);

router.delete(
  "/:productId",
  authenticate,
  removeFromWishlist,
);

export default router;
