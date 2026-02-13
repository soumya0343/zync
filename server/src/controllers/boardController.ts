import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all boards for the authenticated user
export const getBoards = async (
  req: Request & { user?: { userId: string } },
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    const boards = await prisma.board.findMany({
      where: { userId },
      include: {
        columns: {
          orderBy: { order: "asc" },
          include: {
            tasks: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });
    res.json(boards);
  } catch (error) {
    res.status(500).json({ message: "Error fetching boards", error });
  }
};

// Create a new board
export const createBoard = async (
  req: Request & { user?: { userId: string } },
  res: Response,
) => {
  try {
    const { title } = req.body;
    const userId = req.user?.userId;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const board = await prisma.board.create({
      data: {
        title,
        userId,
        columns: {
          create: [
            { title: "To Do", order: 0 },
            { title: "In Progress", order: 1 },
            { title: "Done", order: 2 },
          ],
        },
      },
      include: {
        columns: true,
      },
    });
    res.status(201).json(board);
  } catch (error) {
    res.status(500).json({ message: "Error creating board", error });
  }
};

// Get a single board
export const getBoard = async (
  req: Request & { user?: { userId: string } },
  res: Response,
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (typeof id !== "string") {
      return res.status(400).json({ message: "Invalid board ID" });
    }

    const board = await prisma.board.findFirst({
      where: { id, userId },
      include: {
        columns: {
          orderBy: { order: "asc" },
          include: {
            tasks: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    if (!board) return res.status(404).json({ message: "Board not found" });
    res.json(board);
  } catch (error) {
    res.status(500).json({ message: "Error fetching board", error });
  }
};

// Create a column
export const createColumn = async (
  req: Request & { user?: { userId: string } },
  res: Response,
) => {
  try {
    const { boardId, title, order } = req.body;
    // Verify board belongs to user
    const board = await prisma.board.findFirst({
      where: { id: boardId, userId: req.user?.userId },
    });
    if (!board) return res.status(404).json({ message: "Board not found" });

    const column = await prisma.column.create({
      data: {
        title,
        order,
        boardId,
      },
    });
    res.status(201).json(column);
  } catch (error) {
    res.status(500).json({ message: "Error creating column", error });
  }
};
