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

const BATCH_SIZE = 30;

async function batchGetColumns(columnIds: string[]): Promise<Map<string, any>> {
  const map = new Map<string, any>();
  for (let i = 0; i < columnIds.length; i += BATCH_SIZE) {
    const chunk = columnIds.slice(i, i + BATCH_SIZE);
    const refs = chunk.map((cid) => columnsCol().doc(cid));
    const snaps = await db.getAll(...refs);
    snaps.forEach((snap, idx) => {
      if (snap.exists) map.set(chunk[idx], { id: snap.id, ...snap.data() });
    });
  }
  return map;
}

async function batchGetBoards(boardIds: string[]): Promise<Map<string, any>> {
  const unique = [...new Set(boardIds)];
  const map = new Map<string, any>();
  for (let i = 0; i < unique.length; i += BATCH_SIZE) {
    const chunk = unique.slice(i, i + BATCH_SIZE);
    const refs = chunk.map((bid) => boardsCol().doc(bid));
    const snaps = await db.getAll(...refs);
    snaps.forEach((snap, idx) => {
      if (snap.exists) map.set(chunk[idx], { id: snap.id, ...snap.data() });
    });
  }
  return map;
}

export const getTask = async (
  req: Request & { user?: { userId: string } },
  res: Response,
) => {
  try {
    const { id } = req.params;
    if (typeof id !== "string") return res.status(400).json({ message: "Invalid task ID" });
    const userId = req.user?.userId ?? "";

    // 1. Fetch task, column, board once (no duplicate taskBelongsToUser + re-fetches)
    const taskSnap = await tasksCol().doc(id).get();
    if (!taskSnap.exists) return res.status(404).json({ message: "Task not found" });
    const task = taskToJson(taskSnap);
    const colSnap = await columnsCol().doc(task.columnId).get();
    if (!colSnap.exists) return res.status(404).json({ message: "Task not found" });
    const boardId = colSnap.data()?.boardId as string | undefined;
    const boardSnap = boardId ? await boardsCol().doc(boardId).get() : null;
    if (!boardSnap?.exists || boardSnap.data()?.userId !== userId)
      return res.status(404).json({ message: "Task not found" });
    const boardData = boardSnap.data();
    const boardColsSnap = await columnsCol().where("boardId", "==", boardId).get();
    const boardColumns = boardColsSnap.docs
      .map((d) => ({ id: d.id, title: d.data()?.title, order: d.data()?.order, boardId }))
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    task.column = {
      id: task.columnId,
      ...colSnap.data(),
      boardId,
      board: { id: boardId, title: boardData?.title ?? "Board", columns: boardColumns },
    };

    // 3. Parent chain: sequential task reads (need each to get next parentId), then batch column/board
    const ancestorTasks: { id: string; title: string; columnId: string }[] = [];
    let currentParentId: string | null = task.parentId ?? null;
    while (currentParentId) {
      const parentSnap = await tasksCol().doc(currentParentId).get();
      if (!parentSnap.exists) break;
      const parentData = parentSnap.data();
      ancestorTasks.push({
        id: parentSnap.id,
        title: parentData?.title ?? "",
        columnId: parentData?.columnId ?? "",
      });
      currentParentId = parentData?.parentId ?? null;
    }
    let parentChain: any = null;
    if (ancestorTasks.length > 0) {
      const ancColumnIds = [...new Set(ancestorTasks.map((a) => a.columnId).filter(Boolean))];
      const colMap = await batchGetColumns(ancColumnIds);
      const ancBoardIds = ancestorTasks.map((a) => colMap.get(a.columnId)?.boardId).filter(Boolean);
      const boardMap = await batchGetBoards(ancBoardIds);
      const allowedAncestors: { id: string; title: string }[] = [];
      for (const a of ancestorTasks) {
        const col = colMap.get(a.columnId);
        const board = col ? boardMap.get(col.boardId) : null;
        if (board?.userId === userId) allowedAncestors.push({ id: a.id, title: a.title });
      }
      for (let i = allowedAncestors.length - 1; i >= 0; i--) {
        parentChain = {
          id: allowedAncestors[i].id,
          title: allowedAncestors[i].title,
          parent: parentChain,
        };
      }
    }
    task.parent = parentChain;

    // 4. Subtasks: one query, then batch columns and boards
    const subtasksSnap = await tasksCol().where("parentId", "==", id).get();
    const subtaskColumnIds = [...new Set(subtasksSnap.docs.map((d) => d.data()?.columnId).filter(Boolean))];
    const subColMap = subtaskColumnIds.length > 0 ? await batchGetColumns(subtaskColumnIds) : new Map();
    const subBoardIds = [...new Set([...subColMap.values()].map((c: any) => c.boardId).filter(Boolean))];
    const subBoardMap = subBoardIds.length > 0 ? await batchGetBoards(subBoardIds) : new Map();
    const subtasks: any[] = [];
    for (const subDoc of subtasksSnap.docs) {
      const sub = taskToJson(subDoc);
      const subCol = subColMap.get(sub.columnId);
      if (!subCol) continue;
      const subBoard = subBoardMap.get(subCol.boardId);
      if (!subBoard || subBoard.userId !== userId) continue;
      sub.column = { id: sub.columnId, ...subCol, board: { id: subCol.boardId } };
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
