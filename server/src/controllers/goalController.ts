import { Request, Response } from "express";
import {
  db,
  timestampToDate,
  dateToTimestamp,
} from "../lib/firebase";
import type { Timestamp, DocumentSnapshot, QueryDocumentSnapshot } from "firebase-admin/firestore";
import { FieldPath } from "firebase-admin/firestore";

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

function taskToGoalTaskJson(
  t: QueryDocumentSnapshot,
  columnTitleById: Record<string, string>,
) {
  const td = t.data();
  return {
    id: t.id,
    ...td,
    createdAt: timestampToDate(td.createdAt as Timestamp)?.toISOString(),
    dueDate: td.dueDate ? timestampToDate(td.dueDate as Timestamp)?.toISOString() : null,
    column: { id: td.columnId, title: columnTitleById[td.columnId] ?? "" },
  };
}

async function fetchColumnTitles(columnIds: string[]): Promise<Record<string, string>> {
  const map: Record<string, string> = {};
  for (let i = 0; i < columnIds.length; i += 10) {
    const chunk = columnIds.slice(i, i + 10);
    const snap = await columnsCol().where(FieldPath.documentId(), "in", chunk).get();
    snap.docs.forEach((d) => { map[d.id] = d.data()?.title ?? ""; });
  }
  return map;
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
    const goalIds = docsSorted.map((d) => d.id);
    type TaskDoc = import("firebase-admin/firestore").QueryDocumentSnapshot;
    const tasksByGoalId: Record<string, TaskDoc[]> = {};
    goalIds.forEach((id) => (tasksByGoalId[id] = []));
    if (goalIds.length > 0) {
      for (let i = 0; i < goalIds.length; i += 10) {
        const chunk = goalIds.slice(i, i + 10);
        const tasksSnap = await tasksCol().where("goalId", "in", chunk).get();
        tasksSnap.docs.forEach((t) => {
          const gid = t.data()?.goalId;
          if (gid && tasksByGoalId[gid]) tasksByGoalId[gid].push(t);
        });
      }
      goalIds.forEach((gid) => {
        tasksByGoalId[gid].sort((a, b) => (a.data()?.order ?? 0) - (b.data()?.order ?? 0));
      });
    }
    const allTaskDocs = Object.values(tasksByGoalId).flat();
    const uniqueColIds = [...new Set(allTaskDocs.map((t) => t.data()?.columnId).filter(Boolean))] as string[];
    const columnTitleById = uniqueColIds.length > 0 ? await fetchColumnTitles(uniqueColIds) : {};

    const goals = docsSorted.map((doc) => {
      const g = goalToJson(doc, true);
      if (g) {
        g.tasks = (tasksByGoalId[doc.id] ?? []).map((t) => taskToGoalTaskJson(t, columnTitleById));
      }
      return g;
    }).filter(Boolean);
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
    const colIds = [...new Set(taskDocsSorted.map((t) => t.data()?.columnId).filter(Boolean))] as string[];
    const columnTitleById = colIds.length > 0 ? await fetchColumnTitles(colIds) : {};
    g.tasks = taskDocsSorted.map((t) => taskToGoalTaskJson(t, columnTitleById));
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
