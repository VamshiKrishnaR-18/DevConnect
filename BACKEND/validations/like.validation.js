import { z } from "zod";

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid post ID");

export const toggleLikeSchema = z.object({
  params: z.object({
    postId: objectId,
  }),
});
