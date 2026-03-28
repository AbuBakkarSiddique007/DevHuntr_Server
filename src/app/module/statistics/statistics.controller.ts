import { StatusCodes } from "http-status-codes";
import catchAsync from "../../shared/catchAsync.js";
import sendResponse from "../../shared/sendResponse.js";
import { StatisticsServer } from "./statistics.server.js";

const getStatistics = catchAsync(
    async (_req, res) => {

        const data = await StatisticsServer.getStatistics();

        sendResponse(res, {
            httpStatusCode: StatusCodes.OK,
            success: true,
            message: "Statistics fetched successfully",
            data,
        });
    });

const getPublicStatistics = catchAsync(
    async (_req, res) => {
        const data = await StatisticsServer.getPublicStatistics();

        sendResponse(res, {
            httpStatusCode: StatusCodes.OK,
            success: true,
            message: "Public statistics fetched successfully",
            data,
        });
    });

const getModeratorStatistics = catchAsync(
    async (req, res) => {
        const moderatorId = (req as { user: { userId: string } }).user.userId;
        const data = await StatisticsServer.getModeratorStatistics(moderatorId);

        sendResponse(res, {
            httpStatusCode: StatusCodes.OK,
            success: true,
            message: "Moderator statistics fetched successfully",
            data,
        });
    });

export const StatisticsController = {
    getStatistics,
    getPublicStatistics,
    getModeratorStatistics,
};
