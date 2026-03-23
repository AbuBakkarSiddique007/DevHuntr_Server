import { ProductStatus } from "@prisma/client";
import { prisma } from "../../lib/prisma.js";

const getStatistics = async () => {
    const [
        totalUsers,
        totalProducts,
        totalComments,
        totalVotes,
        totalReports,
        pendingProducts,
        acceptedProducts,
        rejectedProducts,
        featuredProducts,
    ] = await Promise.all([
        prisma.user.count(),
        prisma.product.count(),
        prisma.comment.count(),
        prisma.vote.count(),
        prisma.report.count(),

        prisma.product.count({
            where: {
                status: ProductStatus.PENDING
            }
        }),

        prisma.product.count({
            where: {
                status: ProductStatus.ACCEPTED
            }
        }),

        prisma.product.count({
            where: {
                status: ProductStatus.REJECTED

            }
        }),

        prisma.product.count({
            where: {
                status: ProductStatus.ACCEPTED,
                isFeatured: true
            }
        }),

    ]);

    return {
        totalUsers,
        totalProducts,
        totalComments,
        totalVotes,
        totalReports,
        featuredProducts,
        products: {
            pending: pendingProducts,
            accepted: acceptedProducts,
            rejected: rejectedProducts,
        },
    };
};

export const StatisticsServer = {
    getStatistics,
};
