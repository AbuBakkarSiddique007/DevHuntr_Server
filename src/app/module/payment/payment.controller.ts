import { StatusCodes } from "http-status-codes";
import catchAsync from "../../shared/catchAsync.js";
import sendResponse from "../../shared/sendResponse.js";
import { PaymentServer } from "./payment.server.js";
import AppError from "../../errorHelpers/AppError.js";

const createCheckoutSession = catchAsync(async (req, res) => {
    const userId = req.user!.userId;
    const result = await PaymentServer.createCheckoutSession(userId, req.body);

    sendResponse(res, {
        httpStatusCode: StatusCodes.OK,
        success: true,
        message: "Stripe checkout session created successfully",
        data: result,
    });
});

const handleWebhook = catchAsync(async (req, res) => {
    const signature = req.headers["stripe-signature"] as string;
    const rawBody = req.body as Buffer;

    if (!rawBody || !(rawBody instanceof Buffer)) {
        throw new AppError(StatusCodes.BAD_REQUEST, "Raw body not found or not a Buffer");
    }

    const result = await PaymentServer.handleWebhook(rawBody, signature);

    sendResponse(res, {
        httpStatusCode: StatusCodes.OK,
        success: true,
        message: "Webhook processed successfully",
        data: result,
    });
});

export const PaymentController = {
    createCheckoutSession,
    handleWebhook,
};
