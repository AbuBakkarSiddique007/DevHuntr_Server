import { StatusCodes } from "http-status-codes";
import { type CookieOptions, type Response } from "express";
import catchAsync from "../../shared/catchAsync";
import sendResponse from "../../shared/sendResponse";
import { AuthServer } from "./auth.server";
import { envVars } from "../../config/env";

const ACCESS_TOKEN_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

const getCookieSecurity = () => {
    const frontend = envVars.CLIENT_URL || "";

    const secure = envVars.NODE_ENV === "production" || frontend.startsWith("https://");

    const sameSite: CookieOptions["sameSite"] = secure ? "none" : "lax";

    return {
        secure,
        sameSite
    };
};

const getAuthCookieOptions = (): CookieOptions => {
    const { secure, sameSite } = getCookieSecurity();

    return {
        httpOnly: true,
        secure,
        sameSite,
        path: "/",
        maxAge: ACCESS_TOKEN_COOKIE_MAX_AGE_MS,
    };
};

const setAuthCookie = (res: Response, token: string) => {
    res.cookie("accessToken", token, getAuthCookieOptions());
};

const clearAuthCookie = (res: Response) => {
    const { secure, sameSite } = getCookieSecurity();

    res.clearCookie("accessToken", {
        httpOnly: true,
        secure,
        sameSite,
        path: "/"
    });
};

const register = catchAsync(async (req, res) => {
    const result = await AuthServer.register(req.body);

    setAuthCookie(res, result.token);

    const data = envVars.NODE_ENV === "production" ? { user: result.user } : result;

    sendResponse(res, {
        httpStatusCode: StatusCodes.CREATED,
        success: true,
        message: "User registered successfully",
        data,
    });
});

const login = catchAsync(async (req, res) => {
    const result = await AuthServer.login(req.body);

    setAuthCookie(res, result.token);

    const data = envVars.NODE_ENV === "production" ? { user: result.user } : result;

    sendResponse(res, {
        httpStatusCode: StatusCodes.OK,
        success: true,
        message: "User logged in successfully",
        data,
    });
});

const logout = catchAsync(async (_req, res) => {
    clearAuthCookie(res);

    sendResponse(res, {
        httpStatusCode: StatusCodes.OK,
        success: true,
        message: "User logged out successfully",
        data: null,
    });
});

export const AuthController = {
    register,
    login,
    logout,
};