import { Request, Response } from "express";
import mysql from "mysql2";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { User } from "../models/userModel"; // Make sure to import User interface from userModel.ts
import dotenv from "dotenv";
import path from "path";
import fs from "fs";

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
          {
            userId: user.id,
            username: user.username,
            role: user.role,
            email: user.email,
            profile_picture: user.profile_picture,
          },
          process.env.JWT_SECRET!,
          {
            expiresIn: "1h", // Token expires in 1 hour
          }
        );

        // Send token in response
        res.json({
          username: user.username,
          token,
          user_id: user.id,
          role: user.role,
          email: user.email,
          profile_picture: user.profile_picture,
        });
      });
    }
  );
};

// Get all users sorted by a specified field and order
export const getUsers = (req: Request, res: Response) => {
  const { field, order } = req.query;

  // Validate the field and order
  //console.log("F:" + field + ". O: " + order);
  const validFields = ["username", "role", "email", "tickets_count"];
  const validOrder = ["ASC", "DESC"];

  if (
    !validFields.includes(field as string) ||
    !validOrder.includes(order as string)
  ) {
    return res.status(400).json({ error: "Invalid field or order parameter" });
  }

  // Construct the SQL query
  const sql = `
    SELECT id, username, role, email, profile_picture, (SELECT COUNT(*) FROM Tickets WHERE Tickets.created_by = Users.id) as tickets_count
    FROM Users
    ORDER BY ${mysql.escapeId(field as string)} ${order}
  `;

  //console.log(sql);

  connection.query(sql, (err, results: mysql.RowDataPacket[]) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

// Get a single user by ID
export const getUserById = (req: Request, res: Response) => {
  const { id } = req.params;
  const sql = `
    SELECT 
      Users.id, 
      Users.username, 
      Users.role, 
      Users.email,
      Users.profile_picture,
      (SELECT COUNT(*) FROM Tickets WHERE Tickets.created_by = Users.id) AS tickets_count,
      (SELECT JSON_ARRAYAGG(JSON_OBJECT(
        'id', Tickets.id, 
        'title', Tickets.title, 
        'status', Tickets.status, 
        'priority', Tickets.priority, 
        'description', Tickets.description, 
        'date_created', Tickets.date_created,
        'comments_count', (SELECT COUNT(*) FROM Comments WHERE Comments.ticket_id = Tickets.id)
      )) FROM Tickets WHERE Tickets.created_by = Users.id) AS tickets
    FROM 
      Users 
    WHERE 
      Users.id = ?
  `;

  connection.query(sql, [id], (err, results: mysql.RowDataPacket[]) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(results[0]);
  });
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

    const newUser: User = {
      username,
      password: hashedPassword,
      email,
      role,
      profile_picture: "user-data/images/default-profile.png",
    };

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

// Admin update user profile
export const adminUpdateUserProfile = (req: Request, res: Response) => {
  const { id } = req.params;
  const { role, profile_picture } = req.body;

  // Check if the user exists
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

      // Update user profile
      const updateFields: any = {};
      if (role) updateFields.role = role;
      if (profile_picture) updateFields.profile_picture = profile_picture;

      const updateQuery = "UPDATE Users SET ? WHERE id = ?";
      connection.query(updateQuery, [updateFields, id], (err, results) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        res.json({ message: "User updated successfully" });
      });
    }
  );
};

export const updateUserProfile = (req: Request, res: Response) => {
  const userId = req.params.id;
  const { username, email, password } = req.body;

  let profilePicture = req.body.profilePicture; // Default to the existing profile picture URL

  if (req.file) {
    profilePicture = `user-data/images/${req.file.filename}`;
  }

  // Validate request body
  if (!username && !email && !password && !req.file) {
    return res
      .status(400)
      .json({ message: "At least one field must be filled out" });
  }

  // Check if username already exists
  if (username) {
    connection.query(
      "SELECT * FROM Users WHERE username = ? AND id != ?",
      [username, userId],
      (err, results) => {
        if (err) {
          return res.status(500).json({ error: "Database error" });
        }
        const userResults = results as mysql.RowDataPacket[];
        if (userResults.length > 0) {
          return res.status(400).json({ message: "Username already taken" });
        }

        // Proceed with updating the user
        updateUser();
      }
    );
  } else {
    updateUser();
  }

  function updateUser() {
    // Hash password if provided
    if (password) {
      bcrypt.hash(password, 10, (err, hashedPassword) => {
        if (err) {
          return res.status(500).json({ error: "Failed to hash password" });
        }

        const updatedUser: any = {
          username,
          email,
          password: hashedPassword,
          profile_picture: profilePicture,
        };
        if (!username) delete updatedUser.username;
        if (!email) delete updatedUser.email;

        connection.query(
          "UPDATE Users SET ? WHERE id = ?",
          [updatedUser, userId],
          (err) => {
            if (err) {
              return res.status(500).json({ error: err.message });
            }
            generateNewToken(userId);
          }
        );
      });
    } else {
      const updatedUser: any = {
        username,
        email,
        profile_picture: profilePicture,
      };
      if (!username) delete updatedUser.username;
      if (!email) delete updatedUser.email;

      connection.query(
        "UPDATE Users SET ? WHERE id = ?",
        [updatedUser, userId],
        (err) => {
          if (err) {
            return res.status(500).json({ error: err.message });
          }
          generateNewToken(userId);
        }
      );
    }
  }

  function generateNewToken(userId: string) {
    connection.query(
      "SELECT * FROM Users WHERE id = ?",
      [userId],
      (err, results: any[]) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }

        if (results.length === 0) {
          return res.status(404).json({ message: "User not found" });
        }

        const user = results[0];

        // Generate new JWT token with updated user information
        const token = jwt.sign(
          {
            userId: user.id,
            username: user.username,
            role: user.role,
            email: user.email,
            profile_picture: user.profile_picture,
          },
          process.env.JWT_SECRET!,
          {
            expiresIn: "1h", // Token expires in 1 hour
          }
        );

        // Send the new token and user information in response
        res.json({
          username: user.username,
          token,
          user_id: user.id,
          role: user.role,
          email: user.email,
          profile_picture: user.profile_picture,
        });
      }
    );
  }
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

// Handle profile picture upload
export const uploadProfilePicture = (req: Request, res: Response) => {
  if (!req.file) {
    return res.status(400).json({ message: "No file uploaded" });
  }

  const imagePath = path.join(
    __dirname,
    "../../public/user-data/images",
    req.file.filename
  );

  fs.writeFile(imagePath, req.file.buffer, (err) => {
    if (err) {
      return res.status(500).json({ error: "Failed to save image" });
    }
    res.json({ message: "Profile picture uploaded successfully" });
  });
};
