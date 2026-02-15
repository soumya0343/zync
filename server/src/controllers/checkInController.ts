import { Request, Response } from "express";
import {
  db,
  timestampToDate,
  dateToTimestamp,
} from "../lib/firebase";
import type { Timestamp, DocumentSnapshot } from "firebase-admin/firestore";

const checkInsCol = () => db.collection("dailyCheckIns");

function docToCheckIn(doc: DocumentSnapshot): any {
  const d = doc.data();
  if (!d) return null;
  return {
    id: doc.id,
    date: timestampToDate(d.date as Timestamp)?.toISOString() ?? null,
    content: d.content,
    mood: d.mood ?? null,
    focusedHours: d.focusedHours ?? null,
    reflections: d.reflections ?? null,
    tags: d.tags ?? [],
    isPublic: d.isPublic ?? false,
    userId: d.userId,
    updatedAt: timestampToDate(d.updatedAt as Timestamp)?.toISOString() ?? null,
  };
}

export const getCheckIns = async (
  req: Request & { user?: { userId: string } },
  res: Response,
) => {
  try {
    const userId = req.user?.userId;
    const snap = await checkInsCol().where("userId", "==", userId).get();
    const sorted = [...snap.docs].sort((a, b) => {
      const da = a.data().date?.toMillis?.() ?? 0;
      const db_ = b.data().date?.toMillis?.() ?? 0;
      return db_ - da;
    });
    res.json(sorted.map((d) => docToCheckIn(d)));
  } catch (error: any) {
    if (error?.code === 5 || error?.message?.includes("NOT_FOUND")) {
      return res.json([]);
    }
    res.status(500).json({ message: "Error fetching check-ins", error });
  }
};

export const createCheckIn = async (
  req: Request & { user?: { userId: string } },
  res: Response,
) => {
  try {
    const { content, mood, tags, isPublic, date, focusedHours, reflections } = req.body;
    const userId = req.user?.userId;
    if (!userId) return res.status(401).json({ message: "Unauthorized" });

    const now = new Date();
    const ref = await checkInsCol().add({
      content: content ?? "",
      mood: mood ?? null,
      focusedHours: focusedHours != null ? Number(focusedHours) : null,
      reflections: reflections ?? null,
      tags: Array.isArray(tags) ? tags : [],
      isPublic: isPublic ?? false,
      date: date ? dateToTimestamp(date) : dateToTimestamp(now),
      userId,
      updatedAt: dateToTimestamp(now),
    });
    const snap = await ref.get();
    res.status(201).json(docToCheckIn(snap));
  } catch (error) {
    res.status(500).json({ message: "Error creating check-in", error });
  }
};

export const getCheckIn = async (
  req: Request & { user?: { userId: string } },
  res: Response,
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (typeof id !== "string") return res.status(400).json({ message: "Invalid ID" });

    const doc = await checkInsCol().doc(id).get();
    if (!doc.exists || doc.data()?.userId !== userId)
      return res.status(404).json({ message: "Check-in not found" });
    res.json(docToCheckIn(doc));
  } catch (error) {
    res.status(500).json({ message: "Error fetching check-in", error });
  }
};

export const updateCheckIn = async (
  req: Request & { user?: { userId: string } },
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { content, mood, tags, isPublic, date, focusedHours, reflections } = req.body;
    const userId = req.user?.userId;
    if (typeof id !== "string") return res.status(400).json({ message: "Invalid ID" });

    const doc = await checkInsCol().doc(id).get();
    if (!doc.exists || doc.data()?.userId !== userId)
      return res.status(404).json({ message: "Check-in not found" });

    const update: Record<string, unknown> = { updatedAt: dateToTimestamp(new Date()) };
    if (content !== undefined) update.content = content;
    if (mood !== undefined) update.mood = mood;
    if (tags !== undefined) update.tags = tags;
    if (isPublic !== undefined) update.isPublic = isPublic;
    if (date !== undefined) update.date = dateToTimestamp(date);
    if (focusedHours !== undefined) update.focusedHours = Number(focusedHours);
    if (reflections !== undefined) update.reflections = reflections;

    await checkInsCol().doc(id).update(update);
    const snap = await checkInsCol().doc(id).get();
    res.json(docToCheckIn(snap));
  } catch (error) {
    res.status(500).json({ message: "Error updating check-in", error });
  }
};

export const deleteCheckIn = async (
  req: Request & { user?: { userId: string } },
  res: Response,
) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    if (typeof id !== "string") return res.status(400).json({ message: "Invalid ID" });

    const doc = await checkInsCol().doc(id).get();
    if (!doc.exists || doc.data()?.userId !== userId)
      return res.status(404).json({ message: "Check-in not found" });

    await checkInsCol().doc(id).delete();
    res.json({ message: "Check-in deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting check-in", error });
  }
};
