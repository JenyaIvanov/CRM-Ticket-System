import mysql from "mysql2";
import cors from "cors"; // Import CORS middleware
import express from "express";
import dotenv from "dotenv";
import path from "path";
import ticketRoutes from "./routes/ticketRoutes";
import userRoutes from "./routes/userRoutes";
import commentRoutes from "./routes/commentRoutes";
import knowledgebaseRoutes from "./routes/knowledgebaseRoutes";

dotenv.config();

const app = express();
const port = 3000;

app.use(express.json());

// Enable CORS
app.use(
  cors({
    origin: "http://localhost:3001", // Allow requests from frontend origin
    credentials: true, // Allow sending cookies from frontend
    methods: ["GET", "POST", "PUT", "DELETE"], // Allow only specific methods
    allowedHeaders: ["Content-Type", "Authorization"], // Allow only specific headers
  })
);

// Serve static files from the 'public' directory
app.use(
  "/user-data",
  express.static(path.join(__dirname, "..", "public", "user-data"))
);

// MySQL connection setup
const connection = mysql.createConnection({
  host: process.env.DATABASE_URI,
  port: Number(process.env.DATABASE_PORT),
  user: process.env.DATABASE_USERNAME,
  password: process.env.DATABASE_PASSWORD,
  database: "crm_ticket_system",
});

connection.connect((err) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Connected to the MySQL server.");
});

// Use routes
app.use("/api", ticketRoutes);
app.use("/api", userRoutes);
app.use("/api", commentRoutes);
app.use("/api", knowledgebaseRoutes);

// Basic route
app.get("/", (req, res) => {
  res.send("CRM Ticket System Backend");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
