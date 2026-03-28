import { Prisma } from "@prisma/client";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../lib/prisma.js";
import AppError from "../../errorHelpers/AppError.js";

import type { CastVoteBody, VoteType } from "./vote.interface";

const castVote = async (userId: string, productId: string, payload: CastVoteBody) => {

    const product = await prisma.product.findUnique({
        where: {
            id: productId
        },
        select: {
            id: true
        },
    });

    if (!product) {
        throw new AppError(StatusCodes.NOT_FOUND, "Product not found");
    }

    const requestedVoteType: VoteType = payload.voteType;

    const result = await prisma.$transaction(async (tx) => {
        const existing = await tx.vote.findUnique({
            where: {
                userId_productId: {
                    userId,
                    productId,
                },
            },
            select: {
                id: true,
                voteType: true
            },
        });

        const productUpdateData: Prisma.ProductUpdateInput = {};
        let currentVoteType: VoteType | null = requestedVoteType;


        if (!existing) {
            await tx.vote.create({
                data: {
                    userId,
                    productId,
                    voteType: requestedVoteType,
                },
            });

            if (requestedVoteType === "UPVOTE") {
                productUpdateData.upvoteCount = { increment: 1 };
            } else {
                productUpdateData.downvoteCount = { increment: 1 };
            }

        } else if (existing.voteType === requestedVoteType) {
            await tx.vote.delete({
                where: {
                    id: existing.id
                }
            });

            currentVoteType = null;

            if (requestedVoteType === "UPVOTE") {
                productUpdateData.upvoteCount = { decrement: 1 };
            } else {
                productUpdateData.downvoteCount = { decrement: 1 };
            }
        } else {
            await tx.vote.update({
                where: {
                    id: existing.id
                },
                data: {
                    voteType: requestedVoteType
                },
            });

            if (requestedVoteType === "UPVOTE") {
                // Change from DOWNVOTE to UPVOTE
                productUpdateData.upvoteCount = { increment: 1 };
                productUpdateData.downvoteCount = { decrement: 1 };
            } else {
                // Change from UPVOTE to DOWNVOTE
                productUpdateData.downvoteCount = { increment: 1 };
                productUpdateData.upvoteCount = { decrement: 1 };
            }
        }

        const updatedProduct = await tx.product.update({
            where: { id: productId },
            data: productUpdateData,
            select: {
                upvoteCount: true,
                downvoteCount: true
            },
        });

        return {
            productId,
            voteType: currentVoteType,
            upvoteCount: updatedProduct.upvoteCount,
            downvoteCount: updatedProduct.downvoteCount,
        };
    });

    return result;
};

const checkMyVote = async (userId: string, productId: string) => {
    const product = await prisma.product.findUnique({
        where: {
            id: productId
        },
        select: {
            id: true
        },
    });

    if (!product) {
        throw new AppError(StatusCodes.NOT_FOUND, "Product not found");
    }

    const vote = await prisma.vote.findUnique({
        where: {
            userId_productId: {
                userId,
                productId,
            },
        },
        select: { voteType: true },
    });

    return { productId, voteType: (vote?.voteType as VoteType | undefined) ?? null };
};

export const VoteServer = {
    castVote,
    checkMyVote,
};
