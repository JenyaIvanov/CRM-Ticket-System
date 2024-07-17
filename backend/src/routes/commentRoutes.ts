import express from "express";
import {
  getComments,
  getCommentById,
  getCommentsByTicketId,
  createComment,
  updateComment,
  deleteComment,
} from "../controllers/commentController";
import { authenticateJWT } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/comments", authenticateJWT, getComments);
router.get("/comments/:id", authenticateJWT, getCommentById);
router.post("/comments", authenticateJWT, createComment);
router.put("/comments/:id", authenticateJWT, updateComment);
router.delete("/comments/:id", authenticateJWT, deleteComment);
router.get(
  "/ticket/comments/:ticket_id",
  authenticateJWT,
  getCommentsByTicketId
);

export default router;
