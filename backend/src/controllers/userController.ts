// userController.ts

import { Request, Response } from "express";
import mysql from "mysql2";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/userModel"; // Make sure to import User interface from userModel.ts
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

// Login user
export const loginUser = (req: Request, res: Response) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  // Query database to find user
  connection.query(
    "SELECT * FROM Users WHERE username = ?",
    [username],
    (err, results: any[]) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }

      if (results.length === 0) {
        return res
          .status(401)
          .json({ message: "Invalid username or password." });
      }

      const user = results[0];

      // Check password
      bcrypt.compare(password, user.password, (bcryptErr, bcryptResult) => {
        if (bcryptErr || !bcryptResult) {
          return res
            .status(401)
            .json({ message: "Invalid username or password." });
        }

        // Password is correct, generate JWT token
        const token = jwt.sign(
          { userId: user.id, username: user.username },
          process.env.JWT_SECRET!,
          {
            expiresIn: "1h", // Token expires in 1 hour
          }
        );

        // Send token in response
        res.json({ username: user.username, token });
      });
    }
  );
};

// Get all users
export const getUsers = (req: Request, res: Response) => {
  connection.query(
    "SELECT * FROM Users",
    (err, results: mysql.RowDataPacket[]) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    }
  );
};

// Get a single user by ID
export const getUserById = (req: Request, res: Response) => {
  const { id } = req.params;
  connection.query(
    "SELECT * FROM Users WHERE id = ?",
    [id],
    (err, results: mysql.RowDataPacket[]) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(results[0]);
    }
  );
};

// Create a new user
export const createUser = (req: Request, res: Response) => {
  const { username, password, email, role } = req.body;

  // Validate request body
  if (!username || !password || !email || !role) {
    return res
      .status(400)
      .json({ message: "Username, password, email, and role are required" });
  }

  // Hash password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ error: "Failed to hash password" });
    }

    const newUser: User = { username, password: hashedPassword, email, role };

    connection.query(
      "INSERT INTO Users SET ?",
      newUser,
      (err, results: mysql.OkPacket) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        newUser.id = results.insertId;
        res.status(201).json(newUser);
      }
    );
  });
};

// Update a user
export const updateUser = (req: Request, res: Response) => {
  const { id } = req.params;
  const { username, password, email, role } = req.body;

  // Validate request body
  if (!username || !password || !email || !role) {
    return res
      .status(400)
      .json({ message: "Username, password, email, and role are required" });
  }

  // Hash password
  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) {
      return res.status(500).json({ error: "Failed to hash password" });
    }

    const updatedUser = { username, password: hashedPassword, email, role };

    connection.query(
      "UPDATE Users SET ? WHERE id = ?",
      [updatedUser, id],
      (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.status(200).json({ id, ...updatedUser });
      }
    );
  });
};

// Delete a user
export const deleteUser = (req: Request, res: Response) => {
  const { id } = req.params;
  connection.query("DELETE FROM Users WHERE id = ?", [id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(204).send();
  });
};
