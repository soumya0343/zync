import { Request, Response } from "express";
import {
  db,
  timestampToDate,
  dateToTimestamp,
} from "../lib/firebase";
import type { Timestamp, DocumentSnapshot } from "firebase-admin/firestore";

const tasksCol = () => db.collection("tasks");
const columnsCol = () => db.collection("columns");
const boardsCol = () => db.collection("boards");

async function taskBelongsToUser(taskId: string, userId: string): Promise<boolean> {
  const task = await tasksCol().doc(taskId).get();
  if (!task.exists) return false;
  const columnId = task.data()?.columnId;
  if (!columnId) return false;
  const col = await columnsCol().doc(columnId).get();
  if (!col.exists) return false;
  const boardId = col.data()?.boardId;
  if (!boardId) return false;
  const board = await boardsCol().doc(boardId).get();
  return board.exists && board.data()?.userId === userId;
}

function taskToJson(doc: DocumentSnapshot): any {
  const d = doc.data();
  if (!d) return null;
  return {
    id: doc.id,
    title: d.title,
    description: d.description ?? null,
    priority: d.priority ?? "medium",
    order: d.order,
    columnId: d.columnId,
    goalId: d.goalId ?? null,
    createdAt: timestampToDate(d.createdAt as Timestamp)?.toISOString() ?? null,
    dueDate: d.dueDate ? timestampToDate(d.dueDate as Timestamp)?.toISOString() : null,
    parentId: d.parentId ?? null,
  };
}

export const createTask = async (
  req: Request & { user?: { userId: string } },
  res: Response,
) => {
  try {
    const {
      title,
      columnId,
      description,
      priority,
      dueDate,
      parentId,
      goalId,
    } = req.body;

    const colSnap = await columnsCol().doc(columnId).get();
    if (!colSnap.exists) return res.status(404).json({ message: "Column not found or unauthorized" });
    const boardId = colSnap.data()?.boardId;
    const boardSnap = await boardsCol().doc(boardId).get();
    if (!boardSnap.exists || boardSnap.data()?.userId !== req.user?.userId)
      return res.status(404).json({ message: "Column not found or unauthorized" });

    const existing = await tasksCol().where("columnId", "==", columnId).get();
    const maxOrder = existing.empty ? -1 : Math.max(...existing.docs.map((d) => d.data().order ?? 0));
    const newOrder = maxOrder + 1;

    const ref = await tasksCol().add({
      title,
      columnId,
      description: description ?? null,
      priority: priority ?? "medium",
      dueDate: dueDate ? dateToTimestamp(dueDate) : null,
      order: newOrder,
      parentId: parentId ?? null,
      goalId: goalId ?? null,
      createdAt: dateToTimestamp(new Date()),
    });
    const snap = await ref.get();
    res.status(201).json(taskToJson(snap));
  } catch (error) {
    res.status(500).json({ message: "Error creating task", error });
  }
};

export const getTask = async (
  req: Request & { user?: { userId: string } },
  res: Response,
) => {
  try {
    const { id } = req.params;
    if (typeof id !== "string") return res.status(400).json({ message: "Invalid task ID" });

    const allowed = await taskBelongsToUser(id, req.user?.userId ?? "");
    if (!allowed) return res.status(404).json({ message: "Task not found" });

    const snap = await tasksCol().doc(id).get();
    if (!snap.exists) return res.status(404).json({ message: "Task not found" });

    const task = taskToJson(snap);
    const colSnap = await columnsCol().doc(task.columnId).get();
    const boardId = colSnap.data()?.boardId;
    const boardSnap = boardId ? await boardsCol().doc(boardId).get() : null;
    const boardTitle = boardSnap?.exists ? boardSnap.data()?.title : null;
    task.column = {
      id: task.columnId,
      ...colSnap.data(),
      board: { id: boardId, title: boardTitle ?? "Board" },
    };

    // Build parent chain for breadcrumb hierarchy: task.parent = direct parent, .parent = grandparent, ...
    const ancestors: { id: string; title: string }[] = [];
    let currentParentId: string | null = task.parentId ?? null;
    while (currentParentId) {
      const parentSnap = await tasksCol().doc(currentParentId).get();
      if (!parentSnap.exists) break;
      const parentAllowed = await taskBelongsToUser(currentParentId, req.user?.userId ?? "");
      if (!parentAllowed) break;
      const parentData = parentSnap.data();
      ancestors.push({ id: parentSnap.id, title: parentData?.title ?? "" });
      currentParentId = parentData?.parentId ?? null;
    }
    // Chain so direct parent is task.parent (first in list), then grandparent, then root
    let parentChain: any = null;
    for (let i = ancestors.length - 1; i >= 0; i--) {
      parentChain = { id: ancestors[i].id, title: ancestors[i].title, parent: parentChain };
    }
    task.parent = parentChain;

    // Fetch subtasks (tasks where parentId === this task's id)
    const userId = req.user?.userId ?? "";
    const subtasksSnap = await tasksCol().where("parentId", "==", id).get();
    const subtasks: any[] = [];
    for (const subDoc of subtasksSnap.docs) {
      const sub = taskToJson(subDoc);
      const subColSnap = await columnsCol().doc(sub.columnId).get();
      if (!subColSnap.exists) continue;
      const subBoardId = subColSnap.data()?.boardId;
      const subBoardSnap = await boardsCol().doc(subBoardId).get();
      if (!subBoardSnap.exists || subBoardSnap.data()?.userId !== userId) continue;
      sub.column = { id: sub.columnId, ...subColSnap.data(), board: { id: subBoardId } };
      subtasks.push(sub);
    }
    task.subtasks = subtasks;

    res.json(task);
  } catch (error) {
    res.status(500).json({ message: "Error fetching task", error });
  }
};

export const updateTask = async (
  req: Request & { user?: { userId: string } },
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { title, description, priority, dueDate, columnId, order, goalId } = req.body;
    if (typeof id !== "string") return res.status(400).json({ message: "Invalid task ID" });

    const allowed = await taskBelongsToUser(id, req.user?.userId ?? "");
    if (!allowed) return res.status(404).json({ message: "Task not found or unauthorized" });

    const update: Record<string, unknown> = {};
    if (title !== undefined) update.title = title;
    if (description !== undefined) update.description = description;
    if (priority !== undefined) update.priority = priority;
    if (dueDate !== undefined) update.dueDate = dueDate ? dateToTimestamp(dueDate) : null;
    if (columnId !== undefined) update.columnId = columnId;
    if (order !== undefined) update.order = order;
    if (goalId !== undefined) update.goalId = goalId;
    if (Object.keys(update).length === 0) {
      const snap = await tasksCol().doc(id).get();
      return res.json(taskToJson(snap));
    }

    await tasksCol().doc(id).update(update);
    const snap = await tasksCol().doc(id).get();
    res.json(taskToJson(snap));
  } catch (error) {
    res.status(500).json({ message: "Error updating task", error });
  }
};

export const deleteTask = async (
  req: Request & { user?: { userId: string } },
  res: Response,
) => {
  try {
    const { id } = req.params;
    if (typeof id !== "string") return res.status(400).json({ message: "Invalid task ID" });

    const allowed = await taskBelongsToUser(id, req.user?.userId ?? "");
    if (!allowed) return res.status(404).json({ message: "Task not found" });

    await tasksCol().doc(id).delete();
    res.json({ message: "Task deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting task", error });
  }
};
