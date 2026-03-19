import { StatusCodes } from "http-status-codes";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import { Role } from "../../../generated/prisma/enums";
import { ProductStatus } from "../../../generated/prisma/enums";
import { Prisma } from "../../../generated/prisma/client";

import type {
    CreateProductInput,
    ListAcceptedProductsQuery,
    UpdateProductInput,
} from "./product.interface";

const productInclude = {
    productTags: { include: { tag: true } },
    owner: { select: { id: true, name: true, email: true, photoUrl: true, role: true } },
} as const;

type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

type ProductResponse = Omit<ProductWithRelations, "productTags"> & {
    tags: ProductWithRelations["productTags"][number]["tag"][];
};

const toProductResponse = (product: ProductWithRelations): ProductResponse => {
    const { productTags, ...rest } = product;
    return { ...rest, tags: productTags.map((pt) => pt.tag) };
};


const createProduct = async (ownerId: string, payload: CreateProductInput) => {

    const tagIds = payload.tagIds ?? [];

    if (tagIds.length) {
        const found = await prisma.tag.count({
            where: {
                id: {
                    in: tagIds
                }
            }
        });

        if (found !== tagIds.length) {
            throw new AppError(StatusCodes.BAD_REQUEST, "One or more tags are invalid");
        }
    }

    const product = await prisma.product.create({
        data: {
            name: payload.name,
            image: payload.image,
            description: payload.description,
            externalLink: payload.externalLink,
            ownerId,
            ...(tagIds.length
                ? {
                    productTags: {
                        create: tagIds.map((tagId) => ({ tagId })),
                    },
                }
                : {}),
        },
        include: productInclude,
    });

    return toProductResponse(product);
};

const listAcceptedProducts = async (query: ListAcceptedProductsQuery) => {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = { status: ProductStatus.ACCEPTED };

    if (query.search) {
        where.OR = [
            { name: { contains: query.search, mode: "insensitive" } },
            { description: { contains: query.search, mode: "insensitive" } },
        ];
    }

    if (query.tag) {
        where.productTags = {
            some: {
                tag: {
                    name: { equals: query.tag, mode: "insensitive" },
                },
            },
        };
    }

    const [total, products] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc"
            },

            include: productInclude,
        }),
    ]);

    return {
        meta: { page, limit, total },
        products: products.map(toProductResponse),
    };
};

const listMyProducts = async (ownerId: string, page = 1, limit = 10) => {
    const skip = (page - 1) * limit;

    const where = { ownerId };

    const [total, products] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc"
            },
            include: productInclude,
        }),
    ]);

    return {
        meta: { page, limit, total },
        products: products.map(toProductResponse),
    };
};

const getProductById = async (id: string) => {
    const product = await prisma.product.findUnique({
        where: { id },
        include: productInclude,
    });


    if (!product) {
        throw new AppError(StatusCodes.NOT_FOUND, "Product not found");
    }

    return toProductResponse(product);
};

const assertOwner = async (productId: string, userId: string) => {
    const product = await prisma.product.findUnique({
        where: {
            id: productId
        },
        select: {
            ownerId: true
        }
    });

    if (!product) throw new AppError(StatusCodes.NOT_FOUND, "Product not found");

    if (product.ownerId !== userId) throw new AppError(StatusCodes.FORBIDDEN, "You are not the owner of this product");

};

const updateProduct = async (productId: string, userId: string, payload: UpdateProductInput) => {
    await assertOwner(productId, userId);

    const tagIds = payload.tagIds;
    if (tagIds && tagIds.length) {
        const found = await prisma.tag.count({
            where: {
                id: {
                    in: tagIds
                }
            }
        });


        if (found !== tagIds.length) {
            throw new AppError(StatusCodes.BAD_REQUEST, "One or more tags are invalid");
        }
    }

    const updated = await prisma.$transaction(async (tx) => {
        if (tagIds) {
            await tx.productTag.deleteMany({ where: { productId } });
            if (tagIds.length) {
                await tx.productTag.createMany({
                    data: tagIds.map((tagId) => ({ productId, tagId })),
                    skipDuplicates: true,
                });
            }
        }

        return tx.product.update({
            where: { id: productId },
            data: {
                name: payload.name,
                image: payload.image,
                description: payload.description,
                externalLink: payload.externalLink,
            },
            include: productInclude,
        });
    });

    return toProductResponse(updated);
};

const deleteProduct = async (productId: string, requester: { userId: string; role: Role }) => {
    const product = await prisma.product.findUnique({
        where: {
            id: productId
        },
        select: {
            ownerId: true
        }
    });


    if (!product) throw new AppError(StatusCodes.NOT_FOUND, "Product not found");


    const isOwner = product.ownerId === requester.userId;

    const isPrivileged = requester.role === Role.ADMIN || requester.role === Role.MODERATOR;


    if (!isOwner && !isPrivileged) {
        throw new AppError(StatusCodes.FORBIDDEN, "You are not allowed to delete this product");
    }

    await prisma.product.delete({ where: { id: productId } });
    return null;
};

export const ProductServer = {
    createProduct,
    listAcceptedProducts,
    listMyProducts,
    getProductById,
    updateProduct,
    deleteProduct,
};
