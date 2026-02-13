import { Router } from "express";
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
} from "../controllers/goalController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.use(authenticateToken);

router.get("/", getGoals);
router.post("/", createGoal);
router.put("/:id", updateGoal);
router.delete("/:id", deleteGoal);

export default router;
