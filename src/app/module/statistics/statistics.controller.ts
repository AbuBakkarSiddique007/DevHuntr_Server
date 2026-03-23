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


export const StatisticsController = {
    getStatistics,
};
