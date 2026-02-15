import { Request, Response, NextFunction } from "express";
import { auth } from "../lib/firebase";

interface AuthRequest extends Request {
  user?: {
    userId: string;
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
) => {
  const token =
    req.headers["authorization"]?.startsWith("Bearer ") &&
    req.headers["authorization"].slice(7);

  if (!token) {
    return res.status(401).json({ message: "Authentication required" });
  }

  try {
    const decoded = await auth.verifyIdToken(token);
    req.user = { userId: decoded.uid };
    next();
  } catch {
    return res.status(403).json({ message: "Invalid token" });
  }
};
