import { z } from "zod";

export const createCouponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(3)
    .max(30)
    .regex(/^[A-Za-z0-9_-]+$/, "Code can contain letters, numbers, _ and - only"),

  description: z.string().trim().min(1).max(200),

  expiryDate: z.string().datetime({ offset: true }),

  discountPercentage: z.coerce.number().min(0).max(100),
});


export const validateCodeParamsSchema = z.object({
  code: z.string().trim().min(1).max(30),
});


export const couponIdParamsSchema = z.object({
  id: z.string().uuid("Invalid coupon id"),
});


export const updateCouponSchema = z
  .object({
    code: z
      .string()
      .trim()
      .min(3)
      .max(30)
      .regex(/^[A-Za-z0-9_-]+$/, "Code can contain letters, numbers, _ and - only")
      .optional(),

    description: z.string().trim().min(1).max(200).optional(),
    expiryDate: z.string().datetime({ offset: true }).optional(),
    discountPercentage: z.coerce.number().min(0).max(100).optional(),

  })
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "At least one field is required",
  });

