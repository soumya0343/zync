import { Request, Response } from "express";
import {
  db,
  timestampToDate,
  dateToTimestamp,
} from "../lib/firebase";
import type { Timestamp, DocumentSnapshot } from "firebase-admin/firestore";

const goalsCol = () => db.collection("goals");
const tasksCol = () => db.collection("tasks");
const columnsCol = () => db.collection("columns");

function goalToJson(doc: DocumentSnapshot, includeTasks = false): any {
  const d = doc.data();
  if (!d) return null;
  const g: any = {
    id: doc.id,
    title: d.title,
    description: d.description ?? null,
    category: d.category,
    progress: d.progress ?? 0,
    dueDate: d.dueDate ? timestampToDate(d.dueDate as Timestamp)?.toISOString() : null,
    userId: d.userId,
    createdAt: timestampToDate(d.createdAt as Timestamp)?.toISOString() ?? null,
  };
  if (includeTasks) g.tasks = [];
  return g;
}

export const getGoals = async (
  req: Request & { user?: { userId: string } },
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    const snap = await goalsCol().where("userId", "==", userId).get();
    const docsSorted = [...snap.docs].sort(
      (a, b) => (b.data().createdAt?.toMillis?.() ?? 0) - (a.data().createdAt?.toMillis?.() ?? 0),
    );
    const goals = [];
    for (const doc of docsSorted) {
      const g = goalToJson(doc, true);
      if (g) {
        const tasksSnap = await tasksCol().where("goalId", "==", doc.id).get();
        const taskDocsSorted = [...tasksSnap.docs].sort((a, b) => (a.data().order ?? 0) - (b.data().order ?? 0));
        g.tasks = taskDocsSorted.map((t) => {
          const td = t.data();
          return {
            id: t.id,
            ...td,
            createdAt: timestampToDate(td.createdAt as Timestamp)?.toISOString(),
            dueDate: td.dueDate ? timestampToDate(td.dueDate as Timestamp)?.toISOString() : null,
            column: { id: td.columnId },
          };
        });
        goals.push(g);
      }
    }
    res.json(goals);
  } catch (error: any) {
    if (error?.code === 5 || error?.message?.includes("NOT_FOUND")) {
      return res.json([]);
    }
    res.status(500).json({ message: "Error fetching goals", error });
  }
};

export const getGoal = async (
  req: Request & { user?: { userId: string } },
  res: Response,
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const doc = await goalsCol().doc(id as string).get();
    if (!doc.exists || doc.data()?.userId !== userId)
      return res.status(404).json({ message: "Goal not found" });

    const g = goalToJson(doc, true);
    const tasksSnap = await tasksCol().where("goalId", "==", id).get();
    const taskDocsSorted = [...tasksSnap.docs].sort((a, b) => (a.data().order ?? 0) - (b.data().order ?? 0));
    g.tasks = taskDocsSorted.map((t) => {
      const td = t.data();
      return {
        id: t.id,
        ...td,
        createdAt: timestampToDate(td.createdAt as Timestamp)?.toISOString(),
        dueDate: td.dueDate ? timestampToDate(td.dueDate as Timestamp)?.toISOString() : null,
        column: { id: td.columnId },
      };
    });
    res.json(g);
  } catch (error: any) {
    if (error?.code === 5 || error?.message?.includes("NOT_FOUND")) {
      return res.status(404).json({ message: "Goal not found" });
    }
    res.status(500).json({ message: "Error fetching goal", error });
  }
};

export const createGoal = async (
  req: Request & { user?: { userId: string } },
  res: Response,
) => {
  try {
    const { title, description, category, dueDate } = req.body;
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const ref = await goalsCol().add({
      title,
      description: description ?? null,
      category: category ?? "general",
      progress: 0,
      dueDate: dueDate ? dateToTimestamp(dueDate) : null,
      userId,
      createdAt: dateToTimestamp(new Date()),
    });
    const snap = await ref.get();
    const g = goalToJson(snap);
    if (g) g.tasks = [];
    res.status(201).json(g);
  } catch (error) {
    res.status(500).json({ message: "Error creating goal", error });
  }
};

export const updateGoal = async (
  req: Request & { user?: { userId: string } },
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { title, description, category, progress, dueDate, taskIds } = req.body;
    if (typeof id !== "string") return res.status(400).json({ message: "Invalid goal ID" });

    const doc = await goalsCol().doc(id).get();
    if (!doc.exists || doc.data()?.userId !== req.user?.userId)
      return res.status(404).json({ message: "Goal not found" });

    const update: Record<string, unknown> = {};
    if (title !== undefined) update.title = title;
    if (description !== undefined) update.description = description;
    if (category !== undefined) update.category = category;
    if (progress !== undefined) update.progress = progress;
    if (dueDate !== undefined) update.dueDate = dueDate ? dateToTimestamp(dueDate) : null;
    if (Object.keys(update).length > 0) await goalsCol().doc(id).update(update);

    if (taskIds && Array.isArray(taskIds)) {
      const batch = db.batch();
      const existing = await tasksCol().where("goalId", "==", id).get();
      existing.docs.forEach((d) => batch.update(d.ref, { goalId: null }));
      for (const taskId of taskIds) {
        const taskRef = tasksCol().doc(taskId);
        const t = await taskRef.get();
        if (t.exists) batch.update(taskRef, { goalId: id });
      }
      await batch.commit();
    }

    const updated = await goalsCol().doc(id).get();
    const g = goalToJson(updated);
    if (g) g.tasks = [];
    res.json(g);
  } catch (error) {
    res.status(500).json({ message: "Error updating goal", error });
  }
};

export const deleteGoal = async (
  req: Request & { user?: { userId: string } },
  res: Response,
) => {
  try {
    const { id } = req.params;
    if (typeof id !== "string") return res.status(400).json({ message: "Invalid goal ID" });

    const doc = await goalsCol().doc(id).get();
    if (!doc.exists || doc.data()?.userId !== req.user?.userId)
      return res.status(404).json({ message: "Goal not found" });

    await goalsCol().doc(id).delete();
    res.json({ message: "Goal deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting goal", error });
  }
};
