import { z } from "zod";
import { registry } from "../docs/openapi.js";

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

/* CREATE POST */
export const createPostSchema = z.object({
  body: z.object({
    content: z.string().min(1).max(1000),
  }),
});

registry.register(
  "CreatePostRequest",
  createPostSchema.shape.body
);

/* DELETE POST */
export const deletePostSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});

registry.register("PostIdParam", objectId);
