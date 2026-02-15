import { Request, Response } from "express";
import { auth } from "../lib/firebase";

export const getMe = async (
  req: Request & { user?: { userId: string } },
  res: Response,
) => {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const firebaseUser = await auth.getUser(req.user.userId);
    res.json({
      user: {
        id: firebaseUser.uid,
        email: firebaseUser.email ?? "",
        name: firebaseUser.displayName ?? null,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
  }
};
