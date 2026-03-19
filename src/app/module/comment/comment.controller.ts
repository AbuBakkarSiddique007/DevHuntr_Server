import { StatusCodes } from "http-status-codes";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import AppError from "../../errorHelpers/AppError";
import { CommentServer } from "./comment.server";
import type { ListCommentsQuery } from "./comment.interface";

const createComment = catchAsync(async (req, res) => {
    const authorId = req.user!.userId;

    const created = await CommentServer.createComment(authorId, req.body);


    sendResponse(res, {
        httpStatusCode: StatusCodes.CREATED,
        success: true,
        message: "Comment created successfully",
        data: created,
    });
});


const listCommentsByProduct = catchAsync(async (req, res) => {
    const productIdParam = req.params.productId;
    const productId = Array.isArray(productIdParam) ? productIdParam[0] : productIdParam;

    if (!productId) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Invalid product id");
    }

    const query = req.query as ListCommentsQuery;

    const result = await CommentServer.listCommentsByProduct(productId, query);


    sendResponse(res, {
        httpStatusCode: StatusCodes.OK,
        success: true,
        message: "Comments fetched successfully",
        data: result,
    });
});

export const CommentController = {
    createComment,
    listCommentsByProduct,
};
