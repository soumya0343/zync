import { Request, Response } from "express";
import {
  db,
  timestampToDate,
  dateToTimestamp,
} from "../lib/firebase";
import type { Timestamp, DocumentSnapshot } from "firebase-admin/firestore";

const boardsCol = () => db.collection("boards");
const columnsCol = () => db.collection("columns");

function docToBoard(doc: DocumentSnapshot): any {
  const d = doc.data();
  if (!d) return null;
  return {
    id: doc.id,
    title: d.title,
    userId: d.userId,
    createdAt: timestampToDate(d.createdAt as Timestamp)?.toISOString() ?? null,
  };
}

function docToColumn(doc: DocumentSnapshot): any {
  const d = doc.data();
  if (!d) return null;
  return {
    id: doc.id,
    title: d.title,
    order: d.order,
    boardId: d.boardId,
  };
}

function taskDocToJson(t: DocumentSnapshot) {
  const td = t.data();
  return {
    id: t.id,
    title: td?.title,
    description: td?.description ?? null,
    priority: td?.priority ?? "medium",
    order: td?.order,
    columnId: td?.columnId,
    goalId: td?.goalId ?? null,
    createdAt: timestampToDate(td?.createdAt as Timestamp)?.toISOString() ?? null,
    dueDate: td?.dueDate ? timestampToDate(td.dueDate as Timestamp)?.toISOString() : null,
    parentId: td?.parentId ?? null,
  };
}

async function getColumnsForBoard(boardId: string) {
  const snap = await columnsCol().where("boardId", "==", boardId).get();
  const docsSorted = [...snap.docs].sort((a, b) => (a.data().order ?? 0) - (b.data().order ?? 0));
  const columns: any[] = [];
  const colIds = docsSorted.map((d) => d.id);
  if (colIds.length === 0) return columns;

  const tasksCol = () => db.collection("tasks");
  const allTaskDocs: import("firebase-admin/firestore").QueryDocumentSnapshot[] = [];
  for (let i = 0; i < colIds.length; i += 10) {
    const chunk = colIds.slice(i, i + 10);
    const tasksSnap = await tasksCol().where("columnId", "in", chunk).get();
    tasksSnap.docs.forEach((d) => allTaskDocs.push(d));
  }
  const tasksByColumnId: Record<string, typeof allTaskDocs> = {};
  for (const colId of colIds) tasksByColumnId[colId] = [];
  for (const t of allTaskDocs) {
    const cid = t.data()?.columnId;
    if (cid && tasksByColumnId[cid]) tasksByColumnId[cid].push(t);
  }
  for (const colId of colIds) {
    tasksByColumnId[colId].sort((a, b) => (a.data()?.order ?? 0) - (b.data()?.order ?? 0));
  }

  for (const doc of docsSorted) {
    const col = docToColumn(doc);
    if (col) {
      col.tasks = (tasksByColumnId[doc.id] ?? []).map(taskDocToJson);
      columns.push(col);
    }
  }
  return columns;
}

export const getBoards = async (
  req: Request & { user?: { userId: string } },
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    const snap = await boardsCol().where("userId", "==", userId).get();
    const boardDocs = snap.docs.filter((d) => docToBoard(d));
    const columnsPerBoard = await Promise.all(boardDocs.map((doc) => getColumnsForBoard(doc.id)));
    const boards = boardDocs.map((doc, i) => {
      const b = docToBoard(doc);
      if (b) b.columns = columnsPerBoard[i];
      return b;
    });
    res.json(boards.filter(Boolean));
  } catch (error: any) {
    if (error?.code === 5 || error?.message?.includes("NOT_FOUND")) {
      return res.json([]);
    }
    res.status(500).json({ message: "Error fetching boards", error });
  }
};

export const createBoard = async (
  req: Request & { user?: { userId: string } },
  res: Response,
) => {
  try {
    const { title } = req.body;
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const boardRef = await boardsCol().add({
      title,
      userId,
      createdAt: dateToTimestamp(new Date()),
    });
    const defaultColumns = [
      { title: "To Do", order: 0 },
      { title: "In Progress", order: 1 },
      { title: "Done", order: 2 },
    ];
    for (const col of defaultColumns) {
      await columnsCol().add({
        title: col.title,
        order: col.order,
        boardId: boardRef.id,
      });
    }
    const boardSnap = await boardRef.get();
    const board = docToBoard(boardSnap);
    if (board) {
      board.columns = await getColumnsForBoard(boardRef.id);
      res.status(201).json(board);
    } else {
      res.status(201).json({ id: boardRef.id, title, userId, columns: [] });
    }
  } catch (error: any) {
    console.error("[SERVER] createBoard error:", error?.message ?? error);
    res.status(500).json({ message: "Error creating board", error: error?.message });
  }
};

export const getBoard = async (
  req: Request & { user?: { userId: string } },
  res: Response,
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (typeof id !== "string")
      return res.status(400).json({ message: "Invalid board ID" });

    const doc = await boardsCol().doc(id).get();
    if (!doc.exists || doc.data()?.userId !== userId)
      return res.status(404).json({ message: "Board not found" });

    const board = docToBoard(doc);
    if (board) {
      board.columns = await getColumnsForBoard(id);
      res.json(board);
    } else {
      res.status(404).json({ message: "Board not found" });
    }
  } catch (error: any) {
    if (error?.code === 5 || error?.message?.includes("NOT_FOUND")) {
      return res.status(404).json({ message: "Board not found" });
    }
    res.status(500).json({ message: "Error fetching board", error });
  }
};

export const createColumn = async (
  req: Request & { user?: { userId: string } },
  res: Response,
) => {
  try {
    const { boardId, title, order } = req.body;
    const boardSnap = await boardsCol().doc(boardId).get();
    if (
      !boardSnap.exists ||
      boardSnap.data()?.userId !== req.user?.userId
    )
      return res.status(404).json({ message: "Board not found" });

    const ref = await columnsCol().add({
      title,
      order: order ?? 0,
      boardId,
    });
    const colSnap = await ref.get();
    const col = docToColumn(colSnap);
    if (col) col.tasks = [];
    res.status(201).json(col ?? { id: ref.id, title, order, boardId, tasks: [] });
  } catch (error) {
    res.status(500).json({ message: "Error creating column", error });
  }
};
