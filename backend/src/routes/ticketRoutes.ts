// ticketRoutes.ts
import express from "express";
import {
  getTickets,
  getTicketById,
  createTicket,
  updateTicket,
  updateTicketStatus,
  updateTicketPriority,
  deleteTicket,
  getOpenTicketsCount,
  getInProgressTicketsCount,
  getTotalTicketsCount,
  getTotalUrgentTicketsCount,
  getTotalOpenedTickets,
} from "../controllers/ticketController";
import { authenticateJWT, authorizeUser } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/tickets", authenticateJWT, getTickets); // Apply authenticateJWT middleware
router.get("/tickets/:id", authenticateJWT, getTicketById); // Apply authenticateJWT middleware
router.post("/tickets", authenticateJWT, createTicket); // Apply both authenticateJWT and authorizeUser middlewares
router.put(
  "/tickets/:id",
  authenticateJWT,
  authorizeUser("admin"),
  updateTicket
); // Apply both authenticateJWT and authorizeUser middlewares
router.put("/tickets/update-status/:id", authenticateJWT, updateTicketStatus); // Apply both authenticateJWT and authorizeUser middlewares
router.put(
  "/tickets/update-priority/:id",
  authenticateJWT,
  updateTicketPriority
); // Apply both authenticateJWT and authorizeUser middlewares
router.delete(
  "/tickets/:id",
  authenticateJWT,
  authorizeUser("admin"),
  deleteTicket
); // Apply both authenticateJWT and authorizeUser middlewares

// Additional routes for statistics
router.get(
  "/statistics/tickets/open/count",
  authenticateJWT,
  getOpenTicketsCount
);
router.get(
  "/statistics/tickets/in-progress/count",
  authenticateJWT,
  getInProgressTicketsCount
);
router.get(
  "/statistics/tickets/total/count",
  authenticateJWT,
  getTotalTicketsCount
);

router.get(
  "/statistics/tickets/total-urgent/count",
  authenticateJWT,
  getTotalUrgentTicketsCount
);

router.get(
  "/statistics/tickets/opened/",
  authenticateJWT,
  getTotalOpenedTickets
);

export default router;
