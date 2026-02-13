import { Router } from "express";
import {
  getBoards,
  createBoard,
  getBoard,
  createColumn,
} from "../controllers/boardController";
import { authenticateToken } from "../middleware/auth";

const router = Router();

router.use(authenticateToken); // Protect all board routes

router.get("/", getBoards);
router.post("/", createBoard);
router.get("/:id", getBoard);
router.post("/columns", createColumn);

export default router;
