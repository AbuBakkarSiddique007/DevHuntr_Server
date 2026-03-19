import { StatusCodes } from "http-status-codes";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";

import type { CreateCommentInput, ListCommentsQuery } from "./comment.interface";

const createComment = async (authorId: string, payload: CreateCommentInput) => {
    const product = await prisma.product.findUnique({
        where: {
            id: payload.productId
        },
        select: {
            id: true
        },
    });

    if (!product) {
        throw new AppError(StatusCodes.NOT_FOUND, "Product not found");
    }

    const comment = await prisma.comment.create({
        data: {
            description: payload.description,
            productId: payload.productId,
            authorId,
        },
        include: {
            author: {
                select: {
                    id: true,
                    name: true,
                    photoUrl: true,
                    role: true
                }
            },
        },
    });

    return comment;
};


const listCommentsByProduct = async (productId: string, query: ListCommentsQuery) => {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where = {
        productId,
        isDeleted: false,
    };

    const [total, comments] = await Promise.all([
        prisma.comment.count({ where }),
        prisma.comment.findMany({
            where,
            skip,
            take: limit,
            orderBy: { createdAt: "desc" },
            include: {
                author: {
                    select: {
                        id: true,
                        name: true,
                        photoUrl: true,
                        role: true
                    }
                },
            },
        }),
    ]);

    return {
        meta: { page, limit, total },
        comments,
    };
};

export const CommentServer = {
    createComment,
    listCommentsByProduct,
};
