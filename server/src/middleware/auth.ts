import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../config/database";

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
    username: string;
    role: string;
  };
}

export const auth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ error: "Access denied. No token provided." });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    ) as any;

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, username: true, role: true },
    });

    if (!user) {
      return res.status(401).json({ error: "Invalid token." });
    }

    req.user = user;
    console.log("Authenticated user:", user);
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({ error: "Invalid token." });
  }
};

export const adminAuth = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    await auth(req, res, () => {});

    if (req.user?.role !== "ADMIN") {
      return res
        .status(403)
        .json({ error: "Access denied. Admin role required." });
    }

    next();
  } catch (error) {
    res.status(401).json({ error: "Authentication failed." });
  }
};
