import { StatusCodes } from "http-status-codes";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { UserServer } from "./user.server";
import AppError from "../../errorHelpers/AppError";

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

export const UserController = {
  listUsers,
  getMe,
  updateUserRole,
};
