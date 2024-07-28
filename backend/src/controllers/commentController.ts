import { Request, Response } from "express";
import mysql from "mysql2";
import { Comment } from "../models/commentModel";
import dotenv from "dotenv";

dotenv.config();

// MySQL connection setup
const connection = mysql.createConnection({
  host: process.env.DATABASE_URI,
  port: Number(process.env.DATABASE_PORT),
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: "crm_ticket_system",
});

// Get all comments
export const getComments = (req: Request, res: Response) => {
  connection.query(
    "SELECT * FROM Comments",
    (err, results: mysql.RowDataPacket[]) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(results);
    }
  );
};

// Get comments for a specific ticket by Ticket ID, including the username of the commenter
export const getTicketComments = (req: Request, res: Response) => {
  const { id } = req.params;
  // SQL query to join Comments with User and select username
  var sql = `
SELECT 
    Comments.id, 
    Comments.ticket_id, 
    Comments.comment, 
    Comments.date_created, 
    Users.username, 
    Users.profile_picture 
FROM 
    Comments 
JOIN 
    Users 
ON 
    Comments.user_id = Users.id 
WHERE 
    Comments.ticket_id = ? 
ORDER BY 
    Comments.date_created DESC
  `;

  connection.query(sql, [id], (err, results: mysql.RowDataPacket[]) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

// Get all ticket comments by ID
export const getCommentsByTicketId = (req: Request, res: Response) => {
  const { ticket_id } = req.params;

  if (ticket_id === null || ticket_id === undefined) {
    return res.status(500).json({ error: "Invalid Ticket ID." });
  }

  var sql = mysql.format("SELECT * FROM Comments WHERE ticket_id=?", [
    ticket_id,
  ]);
  connection.query(sql, (err, results: mysql.RowDataPacket[]) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

// Create a new comment
export const createComment = (req: Request, res: Response) => {
  const { ticket_id, user_id, comment } = req.body;
  const date_created = new Date();

  var sql = mysql.format("INSERT INTO Comments SET ?", {
    ticket_id,
    user_id,
    comment,
    date_created,
  });
  connection.query(sql, (err, results: mysql.OkPacket) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      id: results.insertId,
      ticket_id,
      user_id,
      comment,
      date_created,
    });
  });
};

// Update a comment
export const updateComment = (req: Request, res: Response) => {
  const { id } = req.params;
  const comment: Comment = req.body;
  connection.query(
    "UPDATE Comments SET ? WHERE id = ?",
    [comment, id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(200).json({ id, ...comment });
    }
  );
};

// Delete a comment
export const deleteComment = (req: Request, res: Response) => {
  const { id } = req.params;
  var sql = mysql.format("DELETE FROM Comments WHERE id = ?", [id]);
  connection.query(sql, (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(204).send();
  });
};
