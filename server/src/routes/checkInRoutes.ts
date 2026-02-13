import { Router } from "express";
import {
  getCheckIns,
  createCheckIn,
  getCheckIn,
  updateCheckIn,
  deleteCheckIn,
} from "../controllers/checkInController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.use(authenticateToken);

router.get("/", getCheckIns);
router.post("/", createCheckIn);
router.get("/:id", getCheckIn);
router.put("/:id", updateCheckIn);
router.delete("/:id", deleteCheckIn);

export default router;
