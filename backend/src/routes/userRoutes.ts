import express from "express";
import {
  updateUserProfile,
  getUsers,
  getUserById,
  createUser,
  deleteUser,
  loginUser,
} from "../controllers/userController";
import { authenticateJWT } from "../middleware/authMiddleware";
import multer from "multer";
import path from "path";

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, "../../public/user-data/images");
    //console.log("Upload Path: ", uploadPath); // Debug output
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

const router = express.Router();

router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.post("/users", createUser);
router.put(
  "/users/:id",
  authenticateJWT,
  upload.single("profilePicture"),
  updateUserProfile
);
router.delete("/users/:id", deleteUser);
router.post("/users/login", loginUser);

export default router;
