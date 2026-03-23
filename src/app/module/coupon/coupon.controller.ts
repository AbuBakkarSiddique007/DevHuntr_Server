import { StatusCodes } from "http-status-codes";
import catchAsync from "../../shared/catchAsync.js";
import sendResponse from "../../shared/sendResponse.js";
import { CouponServer } from "./coupon.server.js";
import AppError from "../../errorHelpers/AppError.js";


const createCoupon = catchAsync(
  async (req, res) => {
    const adminId = req.user!.userId;

    const created = await CouponServer.createCoupon(adminId, req.body);

    sendResponse(res, {
      httpStatusCode: StatusCodes.CREATED,
      success: true,
      message: "Coupon created successfully",
      data: created,
    });
  });


const listActiveCoupons = catchAsync(
  async (_req, res) => {

    const coupons = await CouponServer.listActiveCoupons();

    sendResponse(res, {
      httpStatusCode: StatusCodes.OK,
      success: true,
      message: "Coupons fetched successfully",
      data: coupons,
    });
  });

const validateCoupon = catchAsync(
  async (req, res) => {

    const codeParam = req.params.code;

    const code = Array.isArray(codeParam) ? codeParam[0] : codeParam;

    if (!code) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Invalid coupon code");
    }

    const result = await CouponServer.validateCouponCode(code);

    sendResponse(res, {
      httpStatusCode: StatusCodes.OK,
      success: true,
      message: "Coupon validation result",
      data: result,
    });
  });

const updateCoupon = catchAsync(
  async (req, res) => {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    if (!id) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Invalid coupon id");
    }

    const updated = await CouponServer.updateCoupon(id, req.body);

    sendResponse(res, {
      httpStatusCode: StatusCodes.OK,
      success: true,
      message: "Coupon updated successfully",
      data: updated,
    });
  });

const deleteCoupon = catchAsync(
  async (req, res) => {
    const idParam = req.params.id;
    const id = Array.isArray(idParam) ? idParam[0] : idParam;

    if (!id) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Invalid coupon id");
    }

    await CouponServer.deleteCoupon(id);

    sendResponse(res, {
      httpStatusCode: StatusCodes.OK,
      success: true,
      message: "Coupon deleted successfully",
      data: null,
    });
  });

export const CouponController = {
  createCoupon,
  listActiveCoupons,
  validateCoupon,
  updateCoupon,
  deleteCoupon,
};
