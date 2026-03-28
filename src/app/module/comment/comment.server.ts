import { StatusCodes } from "http-status-codes";
import { prisma } from "../../lib/prisma.js";
import AppError from "../../errorHelpers/AppError.js";

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
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const where = {
        productId,
        isDeleted: false,
    };

    try {
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
    } catch (error) {
        console.error("Error in listCommentsByProduct:", error);
        throw new AppError(StatusCodes.INTERNAL_SERVER_ERROR, "Error fetching comments from database");
    }
};

export const CommentServer = {
    createComment,
    listCommentsByProduct,
};
