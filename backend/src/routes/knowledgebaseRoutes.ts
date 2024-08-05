import express from "express";
import {
  getArticles,
  getArticleById,
  createArticle,
  updateArticle,
  deleteArticle,
  getCategories,
  addCategories,
  deleteCategories,
} from "../controllers/knowledgeController";
import { authenticateJWT, authorizeUser } from "../middleware/authMiddleware";
import multer from "multer";
import path from "path";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(
      __dirname,
      "../../public/user-data/knowledgebase"
    );
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

const router = express.Router();

router.get("/knowledgebase/categories", authenticateJWT, getCategories);
router.post("/knowledgebase/categories", authenticateJWT, addCategories);
router.delete(
  "/knowledgebase/categories/:id",
  authenticateJWT,
  authorizeUser("admin"),
  deleteCategories
);
router.get("/knowledgebase", authenticateJWT, getArticles);
router.get("/knowledgebase/:id", authenticateJWT, getArticleById);
router.post(
  "/knowledgebase",
  authenticateJWT,
  upload.array("attachments", 4),
  createArticle
);
router.put(
  "/knowledgebase/:id",
  authenticateJWT,
  upload.array("attachments", 4),
  updateArticle
);
router.delete(
  "/knowledgebase/:id",
  authenticateJWT,
  authorizeUser("admin"),
  deleteArticle
);

export default router;
