import { Router } from "express";
import {
  getProductBySlug,
  getProducts,
} from "../controllers/products.controller.js";

const router = Router();

router.get("/", getProducts);
router.get("/:slug", getProductBySlug);

export default router;
