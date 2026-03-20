import { StatusCodes } from "http-status-codes";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import AppError from "../../errorHelpers/AppError";
import { ReportServer } from "./report.server";
import type { ListReportsQuery } from "./report.interface";

const createReport = catchAsync(
    async (req, res) => {
        const reporterId = req.user!.userId;

        const created = await ReportServer.createReport(reporterId, req.body);

        sendResponse(res, {
            httpStatusCode: StatusCodes.CREATED,
            success: true,
            message: "Report created successfully",
            data: created,
        });
    });


const listReports = catchAsync(
    async (req, res) => {
        const query = req.query as ListReportsQuery;

        const result = await ReportServer.listReports(query);

        sendResponse(res, {
            httpStatusCode: StatusCodes.OK,
            success: true,
            message: "Reports fetched successfully",
            data: result,
        });
    });


const deleteReport = catchAsync(
    async (req, res) => {

        const idParam = req.params.id;

        const id = Array.isArray(idParam) ? idParam[0] : idParam;

    if (!id) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Invalid report id");
    }

    await ReportServer.deleteReport(id);

    sendResponse(res, {
        httpStatusCode: StatusCodes.OK,
        success: true,
        message: "Report deleted successfully",
        data: null,
    });
});


export const ReportController = {
    createReport,
    listReports,
    deleteReport,
};
