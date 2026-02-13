import { Router } from "express";
import {
  createTask,
  updateTask,
  deleteTask,
} from "../controllers/taskController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.use(authenticateToken);

router.post("/", createTask);
router.put("/:id", updateTask);
router.delete("/:id", deleteTask);

export default router;
