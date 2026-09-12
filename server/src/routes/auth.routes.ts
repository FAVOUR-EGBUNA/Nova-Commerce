import { Router } from "express";

import { login, register } from "../controllers/auth.controller.js";

import { getMe } from "../controllers/account.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";

const router = Router();

router.post("/register", register);
router.post("/login", login);

router.get("/me", authenticate, getMe);

export default router;
