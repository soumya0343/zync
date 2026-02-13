import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all goals for the user
export const getGoals = async (
  req: Request & { user?: { userId: string } },
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    const goals = await prisma.goal.findMany({
      where: { userId },
      include: {
        tasks: true, // Include tasks associated with the goal
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(goals);
  } catch (error) {
    res.status(500).json({ message: "Error fetching goals", error });
  }
};

// Create a new goal
export const createGoal = async (
  req: Request & { user?: { userId: string } },
  res: Response,
) => {
  try {
    const { title, description, category, dueDate } = req.body;
    const userId = req.user?.userId;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const goal = await prisma.goal.create({
      data: {
        title,
        description,
        category,
        dueDate: dueDate ? new Date(dueDate) : null,
        userId,
      },
      include: { tasks: true },
    });
    res.status(201).json(goal);
  } catch (error) {
    res.status(500).json({ message: "Error creating goal", error });
  }
};

// Update a goal
export const updateGoal = async (
  req: Request & { user?: { userId: string } },
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { title, description, category, progress, dueDate, taskIds } =
      req.body;
    const userId = req.user?.userId;

    if (typeof id !== "string") {
      return res.status(400).json({ message: "Invalid goal ID" });
    }

    // Verify ownership
    const existingGoal = await prisma.goal.findFirst({
      where: { id, userId },
    });

    if (!existingGoal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    // Prepare data for update
    const data: any = {
      title,
      description,
      category,
      progress,
      dueDate: dueDate ? new Date(dueDate) : undefined,
    };

    // If taskIds are provided, update relations
    if (taskIds && Array.isArray(taskIds)) {
      // Connect these tasks to this goal.
      // Note: This simplistic approach connects new tasks. To disconnect, you might need a different strategy or handle it explicitly.
      // For now, let's assume we are adding tasks or replacing the list if using `set`.
      // Using `set` replaces all connected tasks with the provided list.
      data.tasks = {
        set: taskIds.map((taskId: string) => ({ id: taskId })),
      };
    }

    const goal = await prisma.goal.update({
      where: { id },
      data,
      include: { tasks: true },
    });

    res.json(goal);
  } catch (error) {
    res.status(500).json({ message: "Error updating goal", error });
  }
};

// Delete a goal
export const deleteGoal = async (
  req: Request & { user?: { userId: string } },
  res: Response,
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (typeof id !== "string") {
      return res.status(400).json({ message: "Invalid goal ID" });
    }

    // Verify ownership
    const existingGoal = await prisma.goal.findFirst({
      where: { id, userId },
    });

    if (!existingGoal) {
      return res.status(404).json({ message: "Goal not found" });
    }

    await prisma.goal.delete({ where: { id } });
    res.json({ message: "Goal deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting goal", error });
  }
};
