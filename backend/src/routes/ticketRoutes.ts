// ticketRoutes.ts
import express from "express";
import {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  deleteTicket,
} from "../controllers/ticketController";
import { authenticateJWT, authorizeUser } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/tickets", authenticateJWT, getTickets); // Apply authenticateJWT middleware
router.get("/tickets/:id", authenticateJWT, getTicketById); // Apply authenticateJWT middleware
router.post("/tickets", authenticateJWT, authorizeUser("admin"), createTicket); // Apply both authenticateJWT and authorizeUser middlewares
router.put(
  "/tickets/:id",
  authenticateJWT,
  authorizeUser("admin"),
  updateTicket
); // Apply both authenticateJWT and authorizeUser middlewares
router.delete(
  "/tickets/:id",
  authenticateJWT,
  authorizeUser("admin"),
  deleteTicket
); // Apply both authenticateJWT and authorizeUser middlewares

export default router;
