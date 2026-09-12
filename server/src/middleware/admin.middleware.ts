import { NextFunction, Request, Response } from "express";
import prisma from "../config/prisma.js";

export async function requireAdmin(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId = res.locals.userId as string;

    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        role: true,
      },
    });

    if (!user || user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Admin access required",
      });
    }

    next();
  } catch (error) {
    console.error("Admin authorization error:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to verify admin access",
    });
  }
}
