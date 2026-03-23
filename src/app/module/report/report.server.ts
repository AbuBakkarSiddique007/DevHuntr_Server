import { StatusCodes } from "http-status-codes";
import { Prisma } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";
import AppError from "../../errorHelpers/AppError.js";

import type { CreateReportInput, ListReportsQuery, UpdateReportStatusInput } from "./report.interface";

const createReport = async (reporterId: string, payload: CreateReportInput) => {

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

    const report = await prisma.report.create({
        data: {
            productId: payload.productId,
            reporterId,
            reason: payload.reason,
        },

        include: {
            reporter: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    photoUrl: true,
                    role: true
                }
            },

            product: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                    status: true,
                    upvoteCount: true,
                    downvoteCount: true
                }
            },
        },
    });

    return report;
};

const listReports = async (query: ListReportsQuery) => {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const skip = (page - 1) * limit;

    const where: Prisma.ReportWhereInput = {
        status: query.status ?? "OPEN",
    };


    const [total, reports] = await Promise.all([
        prisma.report.count({ where }),
        prisma.report.findMany({
            where,
            skip,
            take: limit,
            orderBy: {
                createdAt: "desc"
            },

            include: {
                reporter: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        photoUrl: true,
                        role: true
                    }
                },

                resolvedBy: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        photoUrl: true,
                        role: true,
                    },
                },

                product: {
                    select: {
                        id: true,
                        name: true,
                        image: true,
                        status: true,
                        upvoteCount: true,
                        downvoteCount: true
                    }
                },
            },
        }),
    ]);

    return {
        meta: { page, limit, total },
        reports,
    };
};

const updateReportStatus = async (
    id: string,
    moderatorId: string,
    payload: UpdateReportStatusInput,
) => {
    const existing = await prisma.report.findUnique({
        where: { id },
        select: { id: true },
    });

    if (!existing) {
        throw new AppError(StatusCodes.NOT_FOUND, "Report not found");
    }

    const updated = await prisma.report.update({
        where: { id },
        data: {
            status: payload.status,
            resolvedById: moderatorId,
            resolvedAt: new Date(),
        },
        include: {
            reporter: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    photoUrl: true,
                    role: true,
                },
            },

            resolvedBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    photoUrl: true,
                    role: true,
                },
            },

            product: {
                select: {
                    id: true,
                    name: true,
                    image: true,
                    status: true,
                    upvoteCount: true,
                    downvoteCount: true,
                },
            },
        },
    });

    return updated;
};


const deleteReport = async (id: string) => {

    const existing = await prisma.report.findUnique({
        where: { id },
        select: {
            id: true
        }
    });

    if (!existing) {
        throw new AppError(StatusCodes.NOT_FOUND, "Report not found");
    }

    await prisma.report.delete({ where: { id } });

    return null;
};

export const ReportServer = {
    createReport,
    listReports,
    updateReportStatus,
    deleteReport,
};
