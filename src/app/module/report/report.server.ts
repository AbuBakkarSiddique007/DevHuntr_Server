import { StatusCodes } from "http-status-codes";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";

import type { CreateReportInput, ListReportsQuery } from "./report.interface";

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


    const [total, reports] = await Promise.all([
        prisma.report.count(),
        prisma.report.findMany({
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
    deleteReport,
};
