import { StatusCodes } from "http-status-codes";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { StatisticsServer } from "./statistics.server";

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
