import { StatusCodes } from "http-status-codes";
import { type CookieOptions, type Response } from "express";
import catchAsync from "../../shared/catchAsync.js";
import sendResponse from "../../shared/sendResponse.js";
import { AuthServer } from "./auth.server.js";
import { getEnvVars } from "../../config/env.js";

const ACCESS_TOKEN_COOKIE_MAX_AGE_MS = 24 * 60 * 60 * 1000;
const REFRESH_TOKEN_COOKIE_MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000;

const getCookieSecurity = () => {
    const { CLIENT_URL, NODE_ENV } = getEnvVars();
    const frontend = CLIENT_URL || "";

    const secure = NODE_ENV === "production" || frontend.startsWith("https://");

    const sameSite: CookieOptions["sameSite"] = secure ? "none" : "lax";

    return {
        secure,
        sameSite
    };
};


const getAccessCookieOptions = (): CookieOptions => {
    const { secure, sameSite } = getCookieSecurity();

    return {
        httpOnly: true,
        secure,
        sameSite,
        path: "/",
        maxAge: ACCESS_TOKEN_COOKIE_MAX_AGE_MS,
    };
};


const getRefreshCookieOptions = (): CookieOptions => {
    const { secure, sameSite } = getCookieSecurity();

    return {
        httpOnly: true,
        secure,
        sameSite,
        path: "/",
        maxAge: REFRESH_TOKEN_COOKIE_MAX_AGE_MS,
    };
};

const setAuthCookies = (res: Response, tokens: { accessToken: string; refreshToken: string }) => {
    res.cookie("accessToken", tokens.accessToken, getAccessCookieOptions());
    res.cookie("refreshToken", tokens.refreshToken, getRefreshCookieOptions());
};


const clearAuthCookies = (res: Response) => {
    const { secure, sameSite } = getCookieSecurity();

    res.clearCookie("accessToken", {
        httpOnly: true,
        secure,
        sameSite,
        path: "/"
    });

    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure,
        sameSite,
        path: "/"
    });
};


const register = catchAsync(async (req, res) => {
    const result = await AuthServer.register(req.body);

    setAuthCookies(res, { accessToken: result.token, refreshToken: result.refreshToken });

    const data = getEnvVars().NODE_ENV === "production" ? { user: result.user } : result;

    sendResponse(res, {
        httpStatusCode: StatusCodes.CREATED,
        success: true,
        message: "User registered successfully",
        data,
    });
});

const login = catchAsync(async (req, res) => {
    const result = await AuthServer.login(req.body);

    setAuthCookies(res, { accessToken: result.token, refreshToken: result.refreshToken });

    const data = getEnvVars().NODE_ENV === "production" ? { user: result.user } : result;

    sendResponse(res, {
        httpStatusCode: StatusCodes.OK,
        success: true,
        message: "User logged in successfully",
        data,
    });
});

const logout = catchAsync(async (_req, res) => {
    clearAuthCookies(res);

    sendResponse(res, {
        httpStatusCode: StatusCodes.OK,
        success: true,
        message: "User logged out successfully",
        data: null,
    });
});

const refresh = catchAsync(async (req, res) => {
    const token = req.cookies?.refreshToken as string | undefined;
    const result = await AuthServer.refresh(token || "");

    setAuthCookies(res, { accessToken: result.accessToken, refreshToken: result.refreshToken });

    sendResponse(res, {
        httpStatusCode: StatusCodes.OK,
        success: true,
        message: "Access token refreshed successfully",
        data: null,
    });
});

export const AuthController = {
    register,
    login,
    logout,
    refresh,
};