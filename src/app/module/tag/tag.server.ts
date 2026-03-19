import { prisma } from "../../lib/prisma";
import { StatusCodes } from "http-status-codes";
import AppError from "../../errorHelpers/AppError";

const listTags = async () => {
    const tags = await prisma.tag.findMany({
        select: {
            id: true,
            name: true
        },

        orderBy: {
            name: "asc"
        },
    });

    return { tags };
};

const createTag = async (createdById: string, payload: { name: string }) => {
    const existing = await prisma.tag.findFirst({
        where: { 
            name: { 
                equals: payload.name, mode: "insensitive" 
            } 
        },
        
        select: { id: true },
    });

    if (existing) {
        throw new AppError(StatusCodes.CONFLICT, "Tag already exists");
    }

    const tag = await prisma.tag.create({
        data: {
            name: payload.name,
            createdById,
        },
        select: { id: true, name: true },
    });

    return tag;
};

export const TagServer = {
    listTags,
    createTag,
};
