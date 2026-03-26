import { StatusCodes } from "http-status-codes";
import { Prisma, ProductStatus, Role } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import AppError from "../../errorHelpers/AppError.js";

import type {
    CreateProductInput,
    ListAcceptedProductsQuery,
    ListModeratedProductsQuery,
    UpdateProductInput,
    UpdateProductStatusInput,
} from "./product.interface";

const productInclude = {
    productTags: { include: { tag: true } },
    owner: { select: { id: true, name: true, email: true, photoUrl: true, role: true } },
} as const;

type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

type ProductResponse = Omit<ProductWithRelations, "productTags"> & {
    tags: ProductWithRelations["productTags"][number]["tag"][];
    openReportCount: number;
};

const toProductResponse = (product: ProductWithRelations): ProductResponse => {
    const { productTags, ...rest } = product;
    return { ...rest, tags: productTags.map((pt) => pt.tag), openReportCount: 0 };
};

const getOpenReportCountMap = async (productIds: string[]) => {
    if (!productIds.length) return new Map<string, number>();

    const grouped = await prisma.report.groupBy({
        by: ["productId"],
        where: {
            productId: { in: productIds },
            status: "OPEN",
        },
        _count: {
            _all: true,
        },
    });

    const map = new Map<string, number>();
    for (const row of grouped) {
        map.set(row.productId, row._count._all);
    }
    return map;
};

const withOpenReportCounts = async (products: ProductWithRelations[]) => {
    const ids = products.map((p) => p.id);
    const map = await getOpenReportCountMap(ids);
    return products.map((p) => ({
        ...toProductResponse(p),
        openReportCount: map.get(p.id) ?? 0,
    }));
};

const withOpenReportCount = async (product: ProductWithRelations) => {
    const openReportCount = await prisma.report.count({
        where: {
            productId: product.id,
            status: "OPEN",
        },
    });

    return {
        ...toProductResponse(product),
        openReportCount,
    };
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

    return { ...toProductResponse(product), openReportCount: 0 };
};

const listAcceptedProducts = async (query: ListAcceptedProductsQuery) => {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
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

    const productsWithCounts = await withOpenReportCounts(products);

    return {
        meta: { page, limit, total },
        products: productsWithCounts,
    };
};

const listFeaturedProducts = async (page = 1, limit = 10) => {
    const skip = (Number(page) - 1) * Number(limit);

    const where: Prisma.ProductWhereInput = {
        status: ProductStatus.ACCEPTED,
        isFeatured: true,
    };


    const [total, products] = await Promise.all([
        prisma.product.count({ where }),

        prisma.product.findMany({
            where,
            skip,
            take: Number(limit),
            orderBy: {
                createdAt: "desc"
            },

            include: productInclude,
        }),
    ]);

    const productsWithCounts = await withOpenReportCounts(products);


    return {
        meta: { page, limit, total },
        products: productsWithCounts,
    };
};

const listTrendingProducts = async (page = 1, limit = 10) => {
    const skip = (Number(page) - 1) * Number(limit);
    const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const [total, ranked] = await Promise.all([
        prisma.product.count({
            where:
            {
                status: ProductStatus.ACCEPTED

            }
        }),


        // 
        prisma.$queryRaw<Array<{ id: string; netVotes: number }>>(
            Prisma.sql`
                SELECT
                    p.id AS id,
                    COALESCE(
                        SUM(
                            CASE
                                WHEN v."voteType" = 'UPVOTE' THEN 1
                                WHEN v."voteType" = 'DOWNVOTE' THEN -1
                                ELSE 0
                            END
                        ),
                        0
                    )::int AS "netVotes"
                FROM "Product" p
                LEFT JOIN "Vote" v
                    ON v."productId" = p.id
                    AND v."createdAt" >= ${since}
                WHERE p."status" = 'ACCEPTED'
                GROUP BY p.id
                ORDER BY "netVotes" DESC, p."createdAt" DESC
                LIMIT ${limit} OFFSET ${skip}
            `,
        ),
    ]);


    const ids = ranked.map((r) => r.id);
    if (!ids.length) {
        return {
            meta: { page, limit, total },
            products: [],
        };
    }

    const products = await prisma.product.findMany({
        where: { id: { in: ids } },
        include: productInclude,
    });

    const byId = new Map(products.map((p) => [p.id, p] as const));
    const ordered = ids.map((id) => byId.get(id)).filter(Boolean) as ProductWithRelations[];

    const productsWithCounts = await withOpenReportCounts(ordered);

    return {
        meta: { page, limit, total },
        products: productsWithCounts,
    };
};

const listMyProducts = async (ownerId: string, page = 1, limit = 10) => {
    const skip = (Number(page) - 1) * Number(limit);

    const where = { ownerId };

    const [total, products] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
            where,
            skip,
            take: Number(limit),
            orderBy: {
                createdAt: "desc"
            },
            include: productInclude,
        }),
    ]);

    const productsWithCounts = await withOpenReportCounts(products);

    return {
        meta: { page, limit, total },
        products: productsWithCounts,
    };
};

const listPendingProducts = async (page = 1, limit = 10) => {
    const skip = (Number(page) - 1) * Number(limit);

    const where: Prisma.ProductWhereInput = { status: ProductStatus.PENDING };

    const [total, products] = await Promise.all([
        prisma.product.count({ where }),

        prisma.product.findMany({
            where,
            skip,
            take: Number(limit),
            orderBy: {
                createdAt: "asc",
            },
            include: productInclude,
        }),
    ]);

    const productsWithCounts = await withOpenReportCounts(products);

    return {
        meta: { page, limit, total },
        products: productsWithCounts,
    };
};

const listModeratedProducts = async (
    query: ListModeratedProductsQuery,
) => {
    const page = Number(query.page ?? 1);
    const limit = Number(query.limit ?? 10);
    const skip = (page - 1) * limit;

    const where: Prisma.ProductWhereInput = {
        status: query.status === "REJECTED" ? ProductStatus.REJECTED : ProductStatus.ACCEPTED,
    };

    const [total, products] = await Promise.all([
        prisma.product.count({ where }),
        prisma.product.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                moderatedAt: "desc",
            },
            include: productInclude,
        }),
    ]);

    const productsWithCounts = await withOpenReportCounts(products);

    return {
        meta: { page, limit, total },
        products: productsWithCounts,
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

    return withOpenReportCount(product);
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

    return withOpenReportCount(updated);
};

const updateProductStatus = async (
    productId: string,
    moderatorId: string,
    payload: UpdateProductStatusInput,
) => {
    const existing = await prisma.product.findUnique({

        where: {
            id: productId
        },

        select: {
            id: true,
            status: true
        },

    });

    if (!existing) throw new AppError(StatusCodes.NOT_FOUND, "Product not found");


    if (existing.status !== ProductStatus.PENDING) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Only PENDING products can be moderated");
    }


    const nextStatus = payload.status === "ACCEPTED" ? ProductStatus.ACCEPTED : ProductStatus.REJECTED;


    const updated = await prisma.product.update({
        where: { id: productId },
        data: {
            status: nextStatus,
            moderatedById: moderatorId,
            moderatedAt: new Date(),
            rejectionReason: payload.status === "REJECTED" ? payload.rejectionReason : null,
            isFeatured: payload.status === "REJECTED" ? false : undefined,
        },
        include: productInclude,
    });

    return withOpenReportCount(updated);
};

const toggleProductFeatured = async (productId: string) => {
    const updated = await prisma.$transaction(async (tx) => {
        const product = await tx.product.findUnique({
            where: {
                id: productId
            },

            select: {
                id: true,
                status: true,
                isFeatured: true
            },

        });

        if (!product) throw new AppError(StatusCodes.NOT_FOUND, "Product not found");

        if (product.status !== ProductStatus.ACCEPTED) {
            throw new AppError(StatusCodes.BAD_REQUEST, "Only ACCEPTED products can be featured");
        }

        return tx.product.update({
            where: {
                id: productId
            },
            data: {
                isFeatured: !product.isFeatured
            },

            include: productInclude,
        });
    });

    return withOpenReportCount(updated);
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

    await prisma.product.delete({
        where: {
            id: productId
        }
    });

    return null;
};

export const ProductServer = {
    createProduct,
    listAcceptedProducts,
    listFeaturedProducts,
    listTrendingProducts,
    listMyProducts,
    listPendingProducts,
    listModeratedProducts,
    getProductById,
    updateProduct,
    updateProductStatus,
    toggleProductFeatured,
    deleteProduct,
};
