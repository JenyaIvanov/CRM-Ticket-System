import { Request, Response } from "express";
import mysql from "mysql2";
import { Ticket } from "../models/ticketModel";
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

export const getTickets = (req: Request, res: Response) => {
  const { status, search } = req.query;
  let query = "SELECT * FROM Tickets";
  let params: any[] = [];

  if (search) {
    query += " WHERE title LIKE ?";
    params.push(`%${search}%`);
  } else if (status) {
    query += " WHERE FIND_IN_SET(status, ?)";
    params.push(status);
  }

  query +=
    " ORDER BY FIELD(status, 'Open', 'In Progress', 'Resolved', 'Closed'), FIELD(priority, 'Urgent', 'High', 'Medium', 'Low'), date_created ASC";

  connection.query(query, params, (err, results: mysql.RowDataPacket[]) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
};

// Get a single ticket by ID
export const getTicketById = (req: Request, res: Response) => {
  const { id } = req.params;
  connection.query(
    "SELECT * FROM Tickets WHERE id = ?",
    [id],
    (err, results: mysql.RowDataPacket[]) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.json(results[0]);
    }
  );
};

// Create a new ticket
export const createTicket = (req: Request, res: Response) => {
  const ticket: Ticket = req.body;
  connection.query(
    "INSERT INTO Tickets SET ?",
    ticket,
    (err, results: mysql.OkPacket) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(201).json({ id: results.insertId, ...ticket });
    }
  );
};

// Update a ticket
export const updateTicket = (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, description, status } = req.body;

  const updateFields: any = {};
  if (title) updateFields.title = title;
  if (description) updateFields.description = description;
  if (status) updateFields.status = status;

  connection.query(
    "UPDATE Tickets SET ? WHERE id = ?",
    [updateFields, id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(200).json({ id, ...updateFields });
    }
  );
};

// Update ticket status
export const updateTicketStatus = (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;

  const updateFields: any = {};
  if (status) updateFields.status = status;

  connection.query(
    "UPDATE Tickets SET ? WHERE id = ?",
    [updateFields, id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(200).json({ id, ...updateFields });
    }
  );
};

// Update ticket priority
export const updateTicketPriority = (req: Request, res: Response) => {
  const { id } = req.params;
  const { priority } = req.body;

  const updateFields: any = {};
  if (priority) updateFields.priority = priority;

  connection.query(
    "UPDATE Tickets SET ? WHERE id = ?",
    [updateFields, id],
    (err) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      res.status(200).json({ id, ...updateFields });
    }
  );
};

// Delete a ticket
export const deleteTicket = (req: Request, res: Response) => {
  const { id } = req.params;
  connection.query("DELETE FROM Tickets WHERE id = ?", [id], (err) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(204).send();
  });
};

// Dashboard
//-- Statistics

export const getOpenTicketsCount = (req: Request, res: Response) => {
  var sql = "SELECT COUNT(*) as count FROM Tickets WHERE status = 'open'";
  connection.query(sql, (err, results: mysql.RowDataPacket[]) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ results });
  });
};

export const getInProgressTicketsCount = (req: Request, res: Response) => {
  var sql =
    "SELECT COUNT(*) as count FROM Tickets WHERE status = 'in progress'";
  connection.query(sql, (err, results: mysql.RowDataPacket[]) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ results });
  });
};

export const getTotalTicketsCount = (req: Request, res: Response) => {
  var sql = "SELECT COUNT(*) as count FROM Tickets";
  connection.query(sql, (err, results: mysql.RowDataPacket[]) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ results });
  });
};

export const getTotalUrgentTicketsCount = (req: Request, res: Response) => {
  var sql = "SELECT COUNT(*) as count FROM Tickets WHERE priority = 'Urgent'";
  connection.query(sql, (err, results: mysql.RowDataPacket[]) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(200).json({ results });
  });
};
