import { StatusCodes } from "http-status-codes";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import AppError from "../../errorHelpers/AppError";
import { VoteServer } from "./vote.server";

const castVote = catchAsync(async (req, res) => {
  const userId = req.user!.userId;

  const productIdParam = req.params.productId;

  const productId = Array.isArray(productIdParam) ? productIdParam[0] : productIdParam;

  if (!productId) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid product id");
  }

  const result = await VoteServer.castVote(userId, productId, req.body);

  sendResponse(res, {
    httpStatusCode: StatusCodes.OK,
    success: true,
    message: "Vote updated successfully",
    data: result,
  });
});

const checkMyVote = catchAsync(async (req, res) => {
  const userId = req.user!.userId;

  const productIdParam = req.params.productId;
  
  const productId = Array.isArray(productIdParam) ? productIdParam[0] : productIdParam;

  if (!productId) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid product id");
  }

  const result = await VoteServer.checkMyVote(userId, productId);

  sendResponse(res, {
    httpStatusCode: StatusCodes.OK,
    success: true,
    message: "Vote status fetched successfully",
    data: result,
  });
});

export const VoteController = {
  castVote,
  checkMyVote,
};
