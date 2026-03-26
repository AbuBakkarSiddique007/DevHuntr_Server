import { StatusCodes } from "http-status-codes";
import catchAsync from "../../shared/catchAsync.js";
import sendResponse from "../../shared/sendResponse.js";
import { UserServer } from "./user.server.js";
import AppError from "../../errorHelpers/AppError.js";

const listUsers = catchAsync(async (req, res) => {

  const { page = 1, limit = 10 } = req.query as unknown as {
    page?: number;
    limit?: number;
  };

  const result = await UserServer.listUsers(page, limit);

  sendResponse(res, {
    httpStatusCode: StatusCodes.OK,
    success: true,
    message: "Users fetched successfully",
    data: result,
  });
});

const getMe = catchAsync(async (req, res) => {

  const me = await UserServer.getMe(req.user!.userId);

  sendResponse(res, {
    httpStatusCode: StatusCodes.OK,
    success: true,
    message: "Profile fetched successfully",
    data: me,
  });
});

const updateUserRole = catchAsync(async (req, res) => {

  const id = (req.params as unknown as { id?: string }).id;
  if (!id) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid user id");
  }

  const { role } = req.body as { role: "USER" | "MODERATOR" | "ADMIN" };
  const updated = await UserServer.updateUserRole(id, role);

  sendResponse(res, {
    httpStatusCode: StatusCodes.OK,
    success: true,
    message: "User role updated successfully",
    data: updated,
  });
});


// 
const updateMySubscription = catchAsync(
  async (req, res) => {

    const userId = req.user!.userId;

    const { isSubscribed } = req.body as { isSubscribed: boolean };

    const updated = await UserServer.updateMySubscription(userId, isSubscribed);


    sendResponse(res, {
      httpStatusCode: StatusCodes.OK,
      success: true,
      message: "Subscription updated successfully",
      data: updated,
    });
  });


const updateProfile = catchAsync(async (req, res) => {
  const userId = req.user!.userId;
  const payload = req.body;

  const result = await UserServer.updateProfile(userId, payload);

  sendResponse(res, {
    httpStatusCode: StatusCodes.OK,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

export const UserController = {
  listUsers,
  getMe,
  updateMySubscription,
  updateUserRole,
  updateProfile,
};
