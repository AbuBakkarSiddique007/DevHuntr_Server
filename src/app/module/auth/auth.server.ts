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


const createToken = (payload: AuthTokenPayload): string => {
    const secret = requireEnv("JWT_SECRET");
    const { JWT_EXPIRES_IN } = getEnvVars();
    const expiresIn = (JWT_EXPIRES_IN || "7d") as SignOptions["expiresIn"];

    return jwt.sign(payload, secret, { expiresIn });
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

    const token = createToken({ userId: user.id, role: user.role });

    const { password: _password, ...userWithoutPassword } = user;

    void _password;


    return {
        token,
        user: userWithoutPassword
    };
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

    const token = createToken({ userId: user.id, role: user.role });

    const { password: _password, ...userWithoutPassword } = user;

    void _password;

    return {
        token,
        user: userWithoutPassword
    };
};

export const AuthServer = {
    register,
    login,
};

