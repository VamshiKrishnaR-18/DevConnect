import express from "express";
import { toggleLike } from "../controllers/postController.js";
import protect from "../middleware/authMiddleware.js";
import validate from "../middleware/validate.js";
import { toggleLikeSchema } from "../validations/like.validation.js";

const router = express.Router();

router.put(
  "/:postId",
  protect,
  validate(toggleLikeSchema),
  toggleLike
);

export default router;
