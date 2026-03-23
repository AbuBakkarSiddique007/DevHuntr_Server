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


        let currentVoteType: VoteType | null = requestedVoteType;


        if (!existing) {
            await tx.vote.create({
                data: {
                    userId,
                    productId,
                    voteType: requestedVoteType,
                },
            });

        } else if (existing.voteType === requestedVoteType) {
            await tx.vote.delete({
                where: {
                    id: existing.id
                }
            });

            currentVoteType = null;
        } else {
            await tx.vote.update({
                where: {
                    id: existing.id
                },
                data: {
                    voteType: requestedVoteType
                },
            });
        }

        const [upvoteCount, downvoteCount] = await Promise.all([
            tx.vote.count({
                where: {
                    productId,
                    voteType: "UPVOTE"
                }
            }),

            tx.vote.count({
                where: {
                    productId,
                    voteType: "DOWNVOTE"
                }
            }),
        ]);

        await tx.product.update({
            where: { id: productId },
            data: {
                upvoteCount,
                downvoteCount,
            },
            select: {
                id: true
            },
        });

        return {
            productId,
            voteType: currentVoteType,
            upvoteCount,
            downvoteCount,
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
