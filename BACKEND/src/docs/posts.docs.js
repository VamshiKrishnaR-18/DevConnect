import { registry } from "./openapi.js";
import { z } from "zod";
import { createPostSchema } from "../validations/post.validation.js";

/* ================== CREATE POST ================== */
registry.registerPath({
  method: "post",
  path: "/posts",
  tags: ["Posts"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: createPostSchema.shape.body,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Post created successfully",
    },
    401: {
      description: "Unauthorized",
    },
  },
});

/* ================== GET POSTS ================== */
registry.registerPath({
  method: "get",
  path: "/posts",
  tags: ["Posts"],
  request: {
    query: z.object({
      page: z.number().optional(),
      limit: z.number().optional(),
    }),
  },
  responses: {
    200: {
      description: "Posts fetched successfully",
    },
  },
});

/* ================== DELETE POST ================== */
registry.registerPath({
  method: "delete",
  path: "/posts/{id}",
  tags: ["Posts"],
  request: {
    params: z.object({
      id: z.string().regex(/^[0-9a-fA-F]{24}$/),
    }),
  },
  responses: {
    200: {
      description: "Post deleted successfully",
    },
    404: {
      description: "Post not found",
    },
  },
});

/* ================== TOGGLE LIKE ================== */
registry.registerPath({
  method: "put",
  path: "/likes/{postId}",
  tags: ["Posts"],
  request: {
    params: z.object({
      postId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    }),
  },
  responses: {
    200: {
      description: "Post liked/unliked",
    },
  },
});
