import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Create a task
interface CreateTaskBody {
  title: string;
  columnId: string;
  description?: string;
  priority?: string;
  dueDate?: string;
  parentId?: string;
}

export const createTask = async (
  req: Request & { user?: { userId: string } },
  res: Response,
) => {
  try {
    const { title, columnId, description, priority, dueDate, parentId } =
      req.body as CreateTaskBody;

    // Verify column belongs to a board owned by user
    const column = await prisma.column.findUnique({
      where: { id: columnId },
      include: { board: true },
    });

    if (!column || column.board.userId !== req.user?.userId) {
      return res
        .status(404)
        .json({ message: "Column not found or unauthorized" });
    }

    // Get max order in column to append to bottom
    const lastTask = await prisma.task.findFirst({
      where: { columnId },
      orderBy: { order: "desc" },
    });
    const newOrder = lastTask ? lastTask.order + 1 : 0;

    const task = await prisma.task.create({
      data: {
        title,
        columnId,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate) : null,
        order: newOrder,
        parentId,
      },
    });

    res.status(201).json(task);
  } catch (error) {
    res.status(500).json({ message: "Error creating task", error });
  }
};

// Get a single task
export const getTask = async (
  req: Request & { user?: { userId: string } },
  res: Response,
) => {
  try {
    const { id } = req.params;
    if (typeof id !== "string") {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await prisma.task.findUnique({
      where: { id },
      include: {
        column: {
          include: { board: true },
        },
        subtasks: {
          include: { column: true },
          orderBy: { order: "asc" },
        },
      },
    });

    if (!task || task.column.board.userId !== req.user?.userId) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Error fetching task", error });
  }
};

// Update a task (move between columns, reorder, edit content)
export const updateTask = async (
  req: Request & { user?: { userId: string } },
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { title, description, priority, dueDate, columnId, order } = req.body;

    if (typeof id !== "string") {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    // Verify task ownership
    const existingTask = await prisma.task.findUnique({
      where: { id },
      include: {
        column: {
          include: { board: true },
        },
      },
    });

    if (
      !existingTask ||
      existingTask.column.board.userId !== req.user?.userId
    ) {
      return res
        .status(404)
        .json({ message: "Task not found or unauthorized" });
    }

    const task = await prisma.task.update({
      where: { id },
      data: {
        title,
        description,
        priority,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        columnId,
        order,
      },
    });

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Error updating task", error });
  }
};

// Delete a task
export const deleteTask = async (
  req: Request & { user?: { userId: string } },
  res: Response,
) => {
  try {
    const { id } = req.params;

    if (typeof id !== "string") {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    // Verify ownership
    const output = await prisma.task.findUnique({
      where: { id },
      include: { column: { include: { board: true } } },
    });

    if (!output || output.column.board.userId !== req.user?.userId) {
      return res.status(404).json({ message: "Task not found" });
    }

    await prisma.task.delete({ where: { id } });
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task", error });
  }
};
