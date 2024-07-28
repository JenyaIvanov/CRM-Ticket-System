// userRoutes.ts

import express from "express";
import {
  updateUserProfile,
  getUsers,
  getUserById,
  createUser,
  deleteUser,
  loginUser, // Import loginUser function
} from "../controllers/userController";
import { authenticateJWT } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/users", getUsers);
router.get("/users/:id", getUserById);
router.post("/users", createUser);
router.put("/users/:id", authenticateJWT, updateUserProfile);
router.delete("/users/:id", deleteUser);
router.post("/users/login", loginUser); // Add loginUser route

export default router;
