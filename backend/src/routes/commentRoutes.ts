import express from "express";
import {
  getComments,
  getTicketComments,
  getCommentsByTicketId,
  createComment,
  updateComment,
  deleteComment,
} from "../controllers/commentController";
import { authenticateJWT } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/comments", authenticateJWT, getComments);
router.get("/comments/:id", authenticateJWT, getTicketComments);
router.post("/comments/:id", authenticateJWT, createComment);
router.put("/comments/:id", authenticateJWT, updateComment);
router.delete("/comments/:id", authenticateJWT, deleteComment);
router.get(
  "/ticket/comments/:ticket_id",
  authenticateJWT,
  getCommentsByTicketId
);

export default router;
