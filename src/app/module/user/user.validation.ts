import { z } from "zod";

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  limit: z.coerce.number().int().positive().max(100).optional(),
});

export const userIdParamsSchema = z.object({
  id: z.string().uuid("Invalid user id"),
});

export const updateUserRoleSchema = z.object({
  role: z.enum(["USER", "MODERATOR", "ADMIN"]),
});

export const updateMySubscriptionSchema = z.object({
  isSubscribed: z.boolean(),
});
