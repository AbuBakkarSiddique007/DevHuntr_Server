import { StatusCodes } from "http-status-codes";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { TagServer } from "./tag.server";

const listTags = catchAsync(async (_req, res) => {
    const result = await TagServer.listTags();

    sendResponse(res, {
        httpStatusCode: StatusCodes.OK,
        success: true,
        message: "Tags fetched successfully",
        data: result,
    });
});

export const TagController = {
    listTags,
    createTag: catchAsync(async (req, res) => {
        const createdById = req.user!.userId;
        
        const created = await TagServer.createTag(createdById, req.body);

        sendResponse(res, {
            httpStatusCode: StatusCodes.CREATED,
            success: true,
            message: "Tag created successfully",
            data: created,
        });
    }),
};
