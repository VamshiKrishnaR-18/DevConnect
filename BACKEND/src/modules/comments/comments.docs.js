import { registry } from "../../docs/openapi.js";
import { z } from "zod";
import { addCommentSchema } from "../../validations/comment.validation.js";

/* ================== ADD COMMENT ================== */
registry.registerPath({
  method: "post",
  path: "/comments",
  tags: ["Comments"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: addCommentSchema.shape.body,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Comment added successfully",
    },
    400: {
      description: "Validation error",
    },
    401: {
      description: "Unauthorized",
    },
  },
});

/* ================== GET COMMENTS ================== */
registry.registerPath({
  method: "get",
  path: "/comments/{postId}",
  tags: ["Comments"],
  request: {
    params: z.object({
      postId: z.string().regex(/^[0-9a-fA-F]{24}$/),
    }),
  },
  responses: {
    200: {
      description: "Comments fetched successfully",
    },
    404: {
      description: "Post not found",
    },
  },
});
