import { z } from "zod";

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid ID format");

//DELETE USER
export const deleteUserSchema = z.object({
  params: z.object({
    userId: objectId,
  }),
});

//DELETE POST
export const deletePostSchema = z.object({
  params: z.object({
    postId: objectId,
  }),
});

//UPDATE SETTINGS
export const updateSettingsSchema = z.object({
  body: z.object({
    siteName: z.string().min(1).optional(),
    siteDescription: z.string().min(1).optional(),
    sessionTimeout: z.number().int().positive().optional(),
    maxLoginAttempts: z.number().int().positive().optional(),
    maintenanceMode: z.boolean().optional(),
    registrationEnabled: z.boolean().optional(),
  }),
});
