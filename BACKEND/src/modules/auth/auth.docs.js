import { registry } from "../../docs/openapi.js";
import { registerSchema, loginSchema } from "../../validations/auth.validation.js";

/* ================== REGISTER ================== */
registry.registerPath({
  method: "post",
  path: "/auth/register",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: registerSchema.shape.body,
        },
      },
    },
  },
  responses: {
    201: {
      description: "User registered successfully",
    },
    400: {
      description: "Validation error",
    },
  },
});

/* ================== LOGIN ================== */
registry.registerPath({
  method: "post",
  path: "/auth/login",
  tags: ["Auth"],
  request: {
    body: {
      content: {
        "application/json": {
          schema: loginSchema.shape.body,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Login successful",
    },
    401: {
      description: "Invalid credentials",
    },
  },
});
