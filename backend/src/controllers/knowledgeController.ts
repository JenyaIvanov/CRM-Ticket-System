import path from "path";
import { Request, Response } from "express";
import mysql from "mysql2";
import dotenv from "dotenv";
import multer from "multer";

dotenv.config();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, "../../public/user-data/knowledgebase"));
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Adjust file size limit as needed
});
const connection = mysql.createConnection({
  host: process.env.DATABASE_URI,
  port: Number(process.env.DATABASE_PORT),
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: "crm_ticket_system",
});

// Get all articles
export const getArticles = (req: Request, res: Response) => {
  const search = (req.query.search as string) || ""; // Ensure search is a string and default to empty if not provided
  const { field, order } = req.query;

  // Validate the field and order
  //console.log("F:" + field + ". O: " + order);
  const validFields = ["title", "category", "date_created"];
  const validOrder = ["ASC", "DESC"];

  if (
    !validFields.includes(field as string) ||
    !validOrder.includes(order as string)
  ) {
    return res.status(400).json({ error: "Invalid field or order parameter" });
  }

  let query = `SELECT 
      knowledgebase.article_id, 
        knowledgebase.author_id, 
        knowledgebase.title, 
        knowledgebase.text, 
        knowledgebase.attachments, 
        knowledgebase.date_created, 
        categories.title AS category
    FROM knowledgebase
    JOIN categories ON knowledgebase.category = categories.id
  `;
  let params: any[] = [];

  // Split the search query into words
  const words = search.trim().split(/\s+/).filter(Boolean);

  if (words.length > 0) {
    // Initialize the WHERE clause
    query +=
      " WHERE " +
      words
        .map(() => "(knowledgebase.title LIKE ? OR knowledgebase.text LIKE ?)")
        .join(" OR ");

    // Prepare the parameters with wildcards for LIKE query
    params = words.flatMap((word) => [`%${word}%`, `%${word}%`]);
  }

  query += ` ORDER BY ${mysql.escapeId(field as string)} ${order};`;

  //console.log(query); // For debugging purposes

  connection.query(query, params, (err, results) => {
    if (err) {
      // Handle errors by responding with a 500 status code and error message
      return res.status(500).json({ error: err.message });
    }
    // Respond with the query results
    res.json(results);
  });
};

// Get a single article by ID
export const getArticleById = (req: Request, res: Response) => {
  const { id } = req.params;
  connection.query(
    "SELECT knowledgebase.article_id, knowledgebase.author_id, knowledgebase.title, knowledgebase.text, knowledgebase.attachments, knowledgebase.date_created, categories.title AS category, categories.id as category_id FROM Knowledgebase JOIN categories ON knowledgebase.category = categories.id WHERE article_id = ?",
    [id],
    (err, results: mysql.RowDataPacket[]) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (results.length === 0) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json(results[0]);
    }
  );
};

// Create an article
export const createArticle = (req: Request, res: Response) => {
  //console.log("Received form fields:", req.body);
  //console.log("Received files:", req.files);

  const { author_id, title, text, category } = req.body;
  const files = req.files as Express.Multer.File[] | undefined;

  if (!files) {
    return res.status(400).json({ error: "No files were uploaded." });
  }

  // Normalize file paths
  const attachments = files.map((file) =>
    path.normalize(path.join("user-data", "knowledgebase", file.filename))
  );

  const query =
    "INSERT INTO Knowledgebase (author_id, title, text, attachments, category) VALUES (?, ?, ?, ?, ?)";
  const params = [
    author_id,
    title,
    text,
    JSON.stringify(attachments),
    category,
  ];

  //console.log(query, params);

  connection.query(query, params, (err, results: any) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      message: "Article created successfully",
      articleId: results.insertId,
    });
  });
};

// Update an article
export const updateArticle = (req: Request, res: Response) => {
  const { id } = req.params;
  const { title, text, attachments, editCategoryId } = req.body;

  let query = "UPDATE Knowledgebase SET ";
  const params: any[] = [];

  if (title) {
    query += "title = ?, ";
    params.push(title);
  }

  if (text) {
    query += "text = ?, ";
    params.push(text);
  }

  if (attachments) {
    query += "attachments = ?, ";
    params.push(JSON.stringify(attachments));
  }

  if (editCategoryId) {
    query += "category = ?, ";
    params.push(editCategoryId);
  }

  // Remove trailing comma and space
  query = query.slice(0, -2);
  query += " WHERE article_id = ?";
  params.push(id);

  connection.query(query, params, (err, results: any) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    if (results.affectedRows === 0) {
      return res.status(404).json({ message: "Article not found" });
    }
    res.json({ message: "Article updated successfully" });
  });
};

// Delete an article by ID
export const deleteArticle = (req: Request, res: Response) => {
  const { id } = req.params;

  connection.query(
    "DELETE FROM Knowledgebase WHERE article_id = ?",
    [id],
    (err, results: any) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Article not found" });
      }
      res.json({ message: "Article deleted successfully" });
    }
  );
};

// Delete a category by ID
export const deleteCategories = (req: Request, res: Response) => {
  const { id } = req.params;

  connection.query(
    "DELETE FROM Categories WHERE id = ?",
    [id],
    (err, results: any) => {
      if (err) {
        return res.status(500).json({ error: err.message });
      }
      if (results.affectedRows === 0) {
        return res.status(404).json({ message: "Category not found" });
      }
      res.json({ message: "Category deleted successfully" });
    }
  );
};

// Create a category
export const addCategories = (req: Request, res: Response) => {
  const { title } = req.body;

  //console.log("Title: ", title);

  if (!title || title.length >= 30) {
    return res.status(400).json({ error: "Please provide a valid title." });
  }

  const query = "INSERT INTO categories (title) VALUES (?)";
  const params = [title];

  connection.query(query, params, (err, results: any) => {
    if (err) {
      return res.status(500).json({ error: err.message });
    }
    res.status(201).json({
      message: "Category created successfully",
      category: results.insertId,
    });
  });
};

// Get all categories
export const getCategories = (req: Request, res: Response) => {
  let query = `SELECT * FROM categories`;

  connection.query(query, (err, results) => {
    if (err) {
      // Handle errors by responding with a 500 status code and error message
      return res.status(500).json({ error: err.message });
    }
    // Respond with the query results
    res.json(results);
  });
};
