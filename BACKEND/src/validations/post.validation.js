import { z } from "zod";
import { registry } from "../docs/openapi.js";

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID");

/* ===================== CREATE TEXT POST ===================== */

export const createPostSchema = z.object({
  body: z.object({
    content: z.string().min(1).max(1000),
  }),
});

registry.register(
  "CreatePostRequest",
  createPostSchema.shape.body
);

/* ===================== CREATE POST WITH MEDIA ===================== */

export const createPostWithMediaSchema = z.object({
  body: z.object({
    content: z.string().max(1000).optional(),
  }),
});

registry.register(
  "CreatePostWithMediaRequest",
  createPostWithMediaSchema.shape.body
);

/* ===================== GET ALL POSTS (PAGINATION) ===================== */

export const getPostsSchema = z.object({
  query: z.object({
    page: z.string().optional(),
    limit: z.string().optional(),
  }),
});

/* ===================== GET / DELETE POST BY ID ===================== */

export const postIdParamSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});

registry.register("PostIdParam", objectId);
