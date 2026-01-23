import { z } from "zod";
import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";

// REQUIRED: extend Zod once, globally
extendZodWithOpenApi(z);

export const registry = new OpenAPIRegistry();

export const generateOpenAPISpec = () => {
  const generator = new OpenApiGeneratorV3(registry.definitions);

  return generator.generateDocument({
    openapi: "3.0.0",
    info: {
      title: "DevConnect API",
      version: "1.0.0",
      description: "API documentation for DevConnect",
    },
    servers: [
      {
        url: "http://localhost:5000/api",
      },
    ],
  });
};
