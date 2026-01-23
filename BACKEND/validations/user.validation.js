import { z } from "zod";

const objectId = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, "Invalid user ID");

/* ===================== GET PROFILE ===================== */
export const getProfileSchema = z.object({
  params: z.object({
    username: z
      .string()
      .min(3, "Username must be at least 3 characters"),
  }),
});

/* ===================== FOLLOW / UNFOLLOW ===================== */
export const followUserSchema = z.object({
  params: z.object({
    id: objectId,
  }),
});
