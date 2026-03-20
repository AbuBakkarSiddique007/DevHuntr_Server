import { z } from "zod";

export const productIdParamsSchema = z.object({
  productId: z.string().uuid("Invalid product id"),
});

export const castVoteBodySchema = z.object({
  voteType: z.enum(["UPVOTE", "DOWNVOTE"]),
});