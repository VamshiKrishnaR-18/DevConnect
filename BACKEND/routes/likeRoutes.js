import express from "express";
import { toggleLike } from "../controllers/postController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.put("/:postId", protect, toggleLike);

export default router;
