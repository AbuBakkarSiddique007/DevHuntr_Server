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

const getPublicStatistics = async () => {
    const [
        totalUsers,
        totalProducts,
        totalComments,
        totalVotes,
    ] = await Promise.all([
        prisma.user.count(),
        prisma.product.count({ where: { status: ProductStatus.ACCEPTED } }),
        prisma.comment.count(),
        prisma.vote.count(),
    ]);

    return {
        totalUsers,
        totalProducts,
        totalComments,
        totalVotes,
    };
};

const getModeratorStatistics = async (moderatorId: string) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [
        pendingReviews,
        activeReports,
        resolvedToday,
        dismissedToday,
        acceptedToday,
        rejectedToday,
    ] = await Promise.all([
        // Current queues:
        prisma.product.count({ where: { status: ProductStatus.PENDING } }),
        prisma.report.count({ where: { status: "OPEN" } }),

        // Moderator's performance today:
        prisma.report.count({
            where: {
                resolvedById: moderatorId,
                status: "RESOLVED",
                resolvedAt: { gte: today },
            },
        }),
        prisma.report.count({
            where: {
                resolvedById: moderatorId,
                status: "DISMISSED",
                resolvedAt: { gte: today },
            },
        }),
        prisma.product.count({
            where: {
                moderatedById: moderatorId,
                status: ProductStatus.ACCEPTED,
                moderatedAt: { gte: today },
            },
        }),
        prisma.product.count({
            where: {
                moderatedById: moderatorId,
                status: ProductStatus.REJECTED,
                moderatedAt: { gte: today },
            },
        }),
    ]);

    return {
        pendingReviews,
        activeReports,
        resolvedToday,
        dismissedToday,
        acceptedToday,
        rejectedToday,
        totalActionsToday: resolvedToday + dismissedToday + acceptedToday + rejectedToday,
    };
};

export const StatisticsServer = {
    getStatistics,
    getPublicStatistics,
    getModeratorStatistics,
};
