// authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import mysql from "mysql2";
import dotenv from "dotenv";

dotenv.config();

const connection = mysql.createConnection({
  host: process.env.DATABASE_URI,
  port: Number(process.env.DATABASE_PORT),
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: "crm_ticket_system",
});

// Define JWT payload interface
interface JWTPayload {
  userId: number;
  username: string;
  role: "admin" | "user";
}

// Extend Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload; // Optional user property for JWT payload
    }
  }
}

export const authenticateJWT = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return res.status(401).json({ message: "Authorization token is required" });
  }

  jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
    if (err) {
      return res.status(403).json({ message: "Failed to authenticate token" });
    }

    const { userId, username, role } = decoded as JWTPayload;

    // Attach user information to request object for further use
    req.user = { userId, username, role };
    next();
  });
};

export const authorizeUser = (requiredRole: "admin" | "user") => {
  return (req: Request, res: Response, next: NextFunction) => {
    const { role } = req.user as JWTPayload;

    if (role !== requiredRole) {
      return res.status(403).json({ message: "Unauthorized access" });
    }

    next();
  };
};
