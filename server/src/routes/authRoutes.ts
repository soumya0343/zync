import { Router } from "express";
import { getMe } from "../controllers/authController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

// Auth is handled by Firebase on the client. Server only exposes /me for profile.
router.get("/me", authenticateToken, getMe);

export default router;
