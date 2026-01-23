import express from "express";

import { toggleLike } from "./post.controller.js";
import authMiddleware from "../../middlewares/auth.middleware.js";
import validate from "../../middlewares/validate.middleware.js";
import { toggleLikeSchema } from "../../validations/like.validation.js";

const router = express.Router();

router.put(
  "/:postId/like",
  authMiddleware,
  validate(toggleLikeSchema),
  toggleLike
);

export default router;
