import { z } from "zod";

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

//ADD COMMENT
export const addCommentSchema = z.object({
  body: z.object({
    postId: objectId,
    text: z
      .string()
      .min(1, "Comment text is required")
      .max(500, "Comment cannot exceed 500 characters"),
  }),
});

//GET COMMENTS
export const getCommentsSchema = z.object({
  params: z.object({
    postId: objectId,
  }),
});

//DELETE COMMENT
export const deleteCommentSchema = z.object({
  params: z.object({
    commentId: objectId,
  }),
});
