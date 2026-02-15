import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Get all check-ins for the user
export const getCheckIns = async (
  req: Request & { user?: { userId: string } },
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    const checkIns = await prisma.dailyCheckIn.findMany({
      where: { userId },
      orderBy: { date: "desc" },
    });
    res.json(checkIns);
  } catch (error) {
    res.status(500).json({ message: "Error fetching check-ins", error });
  }
};

// Create a new check-in
export const createCheckIn = async (
  req: Request & { user?: { userId: string } },
  res: Response,
) => {
  try {
    const { content, mood, tags, isPublic, date, focusedHours, reflections } =
      req.body;
    const userId = req.user?.userId;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const checkIn = await prisma.dailyCheckIn.create({
      data: {
        content,
        mood,
        focusedHours:
          focusedHours != null ? Number(focusedHours) : undefined,
        reflections: reflections ?? undefined,
        tags: tags || [],
        isPublic: isPublic || false,
        date: date ? new Date(date) : new Date(),
        userId,
      },
    });
    res.status(201).json(checkIn);
  } catch (error) {
    res.status(500).json({ message: "Error creating check-in", error });
  }
};

// Get a single check-in
export const getCheckIn = async (
  req: Request & { user?: { userId: string } },
  res: Response,
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (typeof id !== "string") {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const checkIn = await prisma.dailyCheckIn.findFirst({
      where: { id, userId },
    });

    if (!checkIn)
      return res.status(404).json({ message: "Check-in not found" });
    res.json(checkIn);
  } catch (error) {
    res.status(500).json({ message: "Error fetching check-in", error });
  }
};

// Update a check-in
export const updateCheckIn = async (
  req: Request & { user?: { userId: string } },
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { content, mood, tags, isPublic, date, focusedHours, reflections } =
      req.body;
    const userId = req.user?.userId;

    if (typeof id !== "string") {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const existingCheckIn = await prisma.dailyCheckIn.findFirst({
      where: { id, userId },
    });

    if (!existingCheckIn) {
      return res.status(404).json({ message: "Check-in not found" });
    }

    const checkIn = await prisma.dailyCheckIn.update({
      where: { id },
      data: {
        ...(content !== undefined && { content }),
        ...(mood !== undefined && { mood }),
        ...(tags !== undefined && { tags }),
        ...(isPublic !== undefined && { isPublic }),
        ...(date !== undefined && { date: new Date(date) }),
        ...(focusedHours !== undefined && {
          focusedHours: Number(focusedHours),
        }),
        ...(reflections !== undefined && { reflections }),
      },
    });

    res.json(checkIn);
  } catch (error) {
    res.status(500).json({ message: "Error updating check-in", error });
  }
};

// Delete a check-in
export const deleteCheckIn = async (
  req: Request & { user?: { userId: string } },
  res: Response,
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;

    if (typeof id !== "string") {
      return res.status(400).json({ message: "Invalid ID" });
    }

    const existingCheckIn = await prisma.dailyCheckIn.findFirst({
      where: { id, userId },
    });

    if (!existingCheckIn) {
      return res.status(404).json({ message: "Check-in not found" });
    }

    await prisma.dailyCheckIn.delete({ where: { id } });
    res.json({ message: "Check-in deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting check-in", error });
  }
};
