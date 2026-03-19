import { StatusCodes } from "http-status-codes";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { AuthServer } from "./auth.server";

const register = catchAsync(async (req, res) => {
    const result = await AuthServer.register(req.body);

    sendResponse(res, {
        httpStatusCode: StatusCodes.CREATED,
        success: true,
        message: "User registered successfully",
        data: result,
    });
});

const login = catchAsync(async (req, res) => {
    const result = await AuthServer.login(req.body);
    
    sendResponse(res, {
        httpStatusCode: StatusCodes.OK,
        success: true,
        message: "User logged in successfully",
        data: result,
    });
});

export const AuthController = {
    register,
    login,
};

