import { z } from "zod";

export const checkoutSessionSchema = z.object({
  productId: z.string().optional(),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});
