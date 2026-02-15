import { Request, Response } from "express";
import { db, timestampToDate } from "../lib/firebase";
import type { Timestamp, QueryDocumentSnapshot } from "firebase-admin/firestore";

const boardsCol = () => db.collection("boards");
const columnsCol = () => db.collection("columns");
const tasksCol = () => db.collection("tasks");
const goalsCol = () => db.collection("goals");

const isDoneColumn = (title: string) =>
  title.toLowerCase().includes("done") || title.toLowerCase().includes("complete");

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

    const auth = (await import("../lib/firebase")).auth;
    const firebaseUser = await auth.getUser(userId).catch(() => null);
    const userName = firebaseUser?.displayName ?? "User";

    const boardSnap = await boardsCol().where("userId", "==", userId).get();
    const boardIds = boardSnap.docs.map((d) => d.id);
    if (boardIds.length === 0) {
      return res.json({
        userName,
        date: new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }),
        priorityTaskCount: 0,
        todaysTasks: [],
        activeGoals: [],
        productivity: { completedCount: 0, weeklyData: [0, 0, 0, 0, 0, 0, 0], trend: 0 },
        events: [],
      });
    }

    const columnIds: string[] = [];
    const columnById: Record<string, any> = {};
    for (let i = 0; i < boardIds.length; i += 10) {
      const chunk = boardIds.slice(i, i + 10);
      const snap = await columnsCol().where("boardId", "in", chunk).get();
      snap.docs.forEach((d) => {
        columnIds.push(d.id);
        columnById[d.id] = d.data();
      });
    }
    if (columnIds.length === 0) {
      return res.json({
        userName,
        date: new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }),
        priorityTaskCount: 0,
        todaysTasks: [],
        activeGoals: [],
        productivity: { completedCount: 0, weeklyData: [0, 0, 0, 0, 0, 0, 0], trend: 0 },
        events: [],
      });
    }

    const allTaskDocs: QueryDocumentSnapshot[] = [];
    for (let i = 0; i < columnIds.length; i += 10) {
      const chunk = columnIds.slice(i, i + 10);
      const snap = await tasksCol().where("columnId", "in", chunk).get();
      snap.docs.forEach((d) => allTaskDocs.push(d));
    }
    const tasksSnap = { docs: allTaskDocs };
    const tasks = tasksSnap.docs.map((d) => {
      const t = d.data();
      return {
        id: d.id,
        ...t,
        column: { id: t.columnId, title: columnById[t.columnId]?.title },
        createdAt: timestampToDate(t.createdAt as Timestamp),
        dueDate: t.dueDate ? timestampToDate(t.dueDate as Timestamp) : null,
      };
    });

    const todaysTasks = tasks.filter((t) => {
      const d = t.dueDate;
      if (!d) return false;
      const dt = d instanceof Date ? d : new Date(d);
      return dt >= today && dt < tomorrow;
    });

    const priorityTaskCount = tasks.filter((t) => {
      const colTitle = (t.column as any)?.title ?? "";
      const d = t.dueDate;
      if (!d) return false;
      const dt = d instanceof Date ? d : new Date(d);
      return !isDoneColumn(colTitle) && dt >= today && dt < tomorrow;
    }).length;

    const goalsSnap = await goalsCol().where("userId", "==", userId).get();
    const activeGoalsRaw = goalsSnap.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .filter((g: any) => (g.progress ?? 0) < 100)
      .sort((a: any, b: any) => {
        const da = a.dueDate?.toDate?.() ?? (a.dueDate ? new Date(a.dueDate) : new Date(0));
        const db_ = b.dueDate?.toDate?.() ?? (b.dueDate ? new Date(b.dueDate) : new Date(0));
        return da.getTime() - db_.getTime();
      })
      .slice(0, 3);

    const activeGoals = activeGoalsRaw.map((g: any) => {
      const goalTasks = tasks.filter((t: any) => t.goalId === g.id);
      return {
        id: g.id,
        title: g.title,
        description: g.description,
        category: g.category,
        progress: g.progress ?? 0,
        dueDate: g.dueDate ? timestampToDate(g.dueDate as Timestamp) : null,
        tasks: goalTasks.map((t: any) => ({ ...t, column: t.column })),
      };
    });

    const completedTasks = tasks.filter((t) => isDoneColumn((t.column as any)?.title ?? ""));
    const completedCount = completedTasks.length;

    const weeklyData = [0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const startOfDay = new Date(d);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(d);
      endOfDay.setHours(23, 59, 59, 999);
      weeklyData[i] = completedTasks.filter((t) => {
        const raw = t.createdAt;
        if (!raw) return false;
        const u = raw instanceof Date ? raw : new Date(raw);
        return u >= startOfDay && u <= endOfDay;
      }).length;
    }

    const upcomingTasks = tasks.filter((t) => {
      const d = t.dueDate;
      if (!d) return false;
      const dt = d instanceof Date ? d : new Date(d);
      return dt > tomorrow && dt <= nextWeek;
    });
    const upcomingGoals = goalsSnap.docs
      .map((doc) => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data()?.dueDate ? timestampToDate(doc.data().dueDate as Timestamp) : null,
      }))
      .filter((g: any) => g.dueDate && g.dueDate >= today && g.dueDate <= nextWeek);

    const events = [
      ...upcomingTasks.map((t: any) => ({ id: t.id, title: t.title, type: "Task", date: t.dueDate, original: t })),
      ...upcomingGoals.map((g: any) => ({ id: g.id, title: g.title, type: "Goal", date: g.dueDate, original: g })),
    ]
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 5);

    res.json({
      userName,
      date: new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }),
      priorityTaskCount,
      todaysTasks: todaysTasks.map((t: any) => ({ ...t, column: t.column })),
      activeGoals,
      productivity: { completedCount, weeklyData, trend: 0 },
      events: events.map((e: any) => ({
        id: e.id,
        title: e.title,
        time: new Date(e.date).toLocaleDateString("en-US", { weekday: "short" }),
        type: e.type,
        day: new Date(e.date).getDate().toString(),
      })),
    });
  } catch (error: any) {
    const isNotFound = error?.code === 5 || error?.message?.includes("NOT_FOUND");
    if (isNotFound) {
      console.error("[SERVER] Firestore database not found. Create it at https://console.firebase.google.com → your project → Build → Firestore Database → Create database.");
      const auth = (await import("../lib/firebase")).auth;
      const firebaseUser = await auth.getUser(req.user!.userId).catch(() => null);
      const userName = firebaseUser?.displayName ?? "User";
      return res.json({
        userName,
        date: new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" }),
        priorityTaskCount: 0,
        todaysTasks: [],
        activeGoals: [],
        productivity: { completedCount: 0, weeklyData: [0, 0, 0, 0, 0, 0, 0], trend: 0 },
        events: [],
      });
    }
    console.error("Dashboard error:", error);
    res.status(500).json({ message: "Error fetching dashboard data", error });
  }
};
