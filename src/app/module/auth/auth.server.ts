import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { StatusCodes } from "http-status-codes";
import { prisma } from "../../lib/prisma.js";
import { getEnvVars, requireEnv } from "../../config/env.js";
import AppError from "../../errorHelpers/AppError.js";
import {
    type AuthResponse,
    type AuthTokenPayload,
    type LoginInput,
    type RegisterInput,
} from "./auth.interface";


const createAccessToken = (payload: AuthTokenPayload): string => {
    const secret = requireEnv("JWT_SECRET");
    const { JWT_EXPIRES_IN } = getEnvVars();
    const expiresIn = (JWT_EXPIRES_IN || "15m") as SignOptions["expiresIn"];

    return jwt.sign(payload, secret, { expiresIn });
};

const createRefreshToken = (payload: AuthTokenPayload): string => {

    const secret = requireEnv("JWT_SECRET");
    const expiresIn = "30d" as SignOptions["expiresIn"];

    return jwt.sign(payload, secret, { expiresIn });
};

type RefreshResponse = {
    accessToken: string;
    refreshToken: string;
};


const register = async (payload: RegisterInput): Promise<AuthResponse> => {

    const email = payload.email.trim();
    const normalizedEmail = email.toLowerCase();

    const existing = await prisma.user.findFirst({
        where: {
            email: {
                equals: email,
                mode: "insensitive",
            },
        },
    });

    if (existing) {
        throw new AppError(StatusCodes.CONFLICT, "User already exists with this email");
    }

    const hashedPassword = await bcrypt.hash(payload.password, 10);

    const user = await prisma.user.create({
        data: {
            name: payload.name,
            email: normalizedEmail,
            password: hashedPassword,
            photoUrl: payload.photoUrl,
        },
    });

    const accessToken = createAccessToken({ userId: user.id, role: user.role });
    const refreshToken = createRefreshToken({ userId: user.id, role: user.role });

    const { password: _password, ...userWithoutPassword } = user;

    void _password;


    return {
        token: accessToken,
        user: userWithoutPassword,
        refreshToken,
    } as AuthResponse & { refreshToken: string };
};



const login = async (payload: LoginInput): Promise<AuthResponse> => {

    const email = payload.email.trim();

    const user = await prisma.user.findFirst({
        where: {
            email: {
                equals: email,
                mode: "insensitive",
            },
        },
    });

    if (!user) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
    }

    const isMatch = await bcrypt.compare(payload.password, user.password);

    if (!isMatch) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid email or password");
    }

    const accessToken = createAccessToken({ userId: user.id, role: user.role });
    const refreshToken = createRefreshToken({ userId: user.id, role: user.role });

    const { password: _password, ...userWithoutPassword } = user;

    void _password;

    return {
        token: accessToken,
        user: userWithoutPassword,
        refreshToken,
    } as AuthResponse & { refreshToken: string };
};

const refresh = async (refreshToken: string): Promise<RefreshResponse> => {
    if (!refreshToken) {
        throw new AppError(StatusCodes.UNAUTHORIZED, "Refresh token is missing");
    }

    try {
        const decoded = jwt.verify(refreshToken, requireEnv("JWT_SECRET")) as AuthTokenPayload & {
            iat?: number;
            exp?: number;
        };

        if (!decoded?.userId || !decoded?.role) {
            throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid refresh token");
        }

        const accessToken = createAccessToken({ userId: decoded.userId, role: decoded.role });
        const nextRefreshToken = createRefreshToken({ userId: decoded.userId, role: decoded.role });

        return {
            accessToken,
            refreshToken: nextRefreshToken,
        };
    } catch {
        throw new AppError(StatusCodes.UNAUTHORIZED, "Invalid or expired refresh token");
    }
};

export const AuthServer = {
    register,
    login,
    refresh,
};

