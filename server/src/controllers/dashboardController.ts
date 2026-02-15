import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const getDashboardData = async (
  req: Request & { user?: { userId: string } },
  res: Response,
) => {
  try {
    const userId = req.user?.userId;

    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date(today);
    nextWeek.setDate(nextWeek.getDate() + 7);

    // 1. User Info (already have from auth, but let's be explicit if needed, or just use name from token logic if sufficient.
    // actually, we might want the name if not stored in token)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    // 2. Today's Focus: Tasks due today or older but not done
    // Actually "Today's Focus" usually means due today.
    // Let's get tasks due today.
    const todaysTasks = await prisma.task.findMany({
      where: {
        column: { board: { userId } },
        dueDate: {
          gte: today, // Start of today
          lt: tomorrow, // Start of tomorrow
        },
        // internal/active only?
        // Let's assume we show all, even if done, so user sees progress.
        // Or maybe only not done? The mock showed "todo".
        // Let's filter out 'Done' columns if possible, but difficult by name.
        // Let's just return them and frontend can filter or show status.
      },
      include: {
        column: true,
      },
      orderBy: { priority: "asc" }, // urgent(0) first
    });

    // 3. Priority Task Count
    // "High" or "Urgent" tasks that are NOT in a "Done" column
    // We need to find "Done" columns first to exclude them, or just use string matching
    const tasks = await prisma.task.findMany({
      where: {
        column: { board: { userId } },
      },
      include: { column: true },
    });

    const isDoneColumn = (title: string) =>
      title.toLowerCase().includes("done") ||
      title.toLowerCase().includes("complete");

    const priorityTaskCount = tasks.filter(
      (t) =>
        !isDoneColumn(t.column.title) &&
        t.dueDate &&
        new Date(t.dueDate) >= today && // Start of today
        new Date(t.dueDate) < tomorrow, // End of today
    ).length;

    // 4. Active Goals
    const activeGoals = await prisma.goal.findMany({
      where: {
        userId,
        progress: { lt: 100 },
      },
      take: 3, // Limit to 3 for the widget
      orderBy: { dueDate: "asc" },
    });

    // 5. Productivity (Completed Tasks)
    const completedTasks = tasks.filter((t) => isDoneColumn(t.column.title));
    const completedCount = completedTasks.length;

    // 6. Weekly Productivity
    // NOTE: Task model doesn't have updatedAt yet, using createdAt as proxy for activity
    const weeklyData = Array(7).fill(0);
    const now = new Date();

    // Iterate last 7 days.
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i)); // 6 days ago to today
      const startOfDay = new Date(d.setHours(0, 0, 0, 0));
      const endOfDay = new Date(d.setHours(23, 59, 59, 999));

      const count = completedTasks.filter((t) => {
        const u = new Date(t.createdAt);
        return u >= startOfDay && u <= endOfDay;
      }).length;

      weeklyData[i] = count;
    }

    // 7. Upcoming Events
    const upcomingTasks = await prisma.task.findMany({
      where: {
        column: { board: { userId } },
        dueDate: {
          gt: tomorrow,
          lte: nextWeek,
        },
      },
      include: { column: true },
    });

    const upcomingGoals = await prisma.goal.findMany({
      where: {
        userId,
        dueDate: {
          gte: today,
          lte: nextWeek,
        },
      },
    });

    const events = [
      ...upcomingTasks.map((t) => ({
        id: t.id,
        title: t.title,
        time: "Task",
        type: "Task",
        date: t.dueDate!, // Guaranteed by query
        original: t,
      })),
      ...upcomingGoals.map((g) => ({
        id: g.id,
        title: g.title,
        time: "Goal",
        type: "Goal",
        date: g.dueDate!, // Guaranteed by query
        original: g,
      })),
    ]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);

    res.json({
      userName: user?.name || "User",
      date: new Date().toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
      }),
      priorityTaskCount,
      todaysTasks,
      activeGoals,
      productivity: {
        completedCount,
        weeklyData,
        trend: 0, // Mock for now
      },
      events: events.map((e) => ({
        id: e.id,
        title: e.title,
        time: new Date(e.date!).toLocaleDateString("en-US", {
          weekday: "short",
        }), // Just show day for now
        type: e.type,
        day: new Date(e.date!).getDate().toString(),
      })),
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Error fetching dashboard data", error });
  }
};
