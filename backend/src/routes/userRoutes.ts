import express from "express";
import {
  adminUpdateUserProfile,
  updateUserProfile,
  getUsers,
  getUserById,
  createUser,
  deleteUser,
  loginUser,
} from "../controllers/userController";
import { authenticateJWT, authorizeUser } from "../middleware/authMiddleware";
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

router.get("/users", authenticateJWT, authorizeUser("admin"), getUsers);
router.get("/users/:id", authenticateJWT, getUserById);
router.post("/users", createUser);
router.put(
  "/user-management/users/:id",
  authenticateJWT,
  authorizeUser("admin"),
  adminUpdateUserProfile
);
router.put(
  "/users/:id",
  authenticateJWT,
  upload.single("profilePicture"),
  updateUserProfile
);
router.delete(
  "/users/:id",
  authenticateJWT,
  authorizeUser("admin"),
  deleteUser
);
router.post("/users/login", loginUser);

export default router;
