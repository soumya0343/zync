import { Router } from "express";
import {
  getGoals,
  getGoal,
  createGoal,
  updateGoal,
  deleteGoal,
} from "../controllers/goalController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.use(authenticateToken);

router.get("/", getGoals);
router.get("/:id", getGoal);
router.post("/", createGoal);
router.put("/:id", updateGoal);
router.delete("/:id", deleteGoal);

export default router;
