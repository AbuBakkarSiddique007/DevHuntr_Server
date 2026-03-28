import dotenv from 'dotenv';
dotenv.config();

export interface EnvVars {
    NODE_ENV: string;
    PORT?: string;
    DATABASE_URL?: string;
    JWT_SECRET?: string;
    JWT_EXPIRES_IN?: string;
    CLIENT_URL?: string;
    ADMIN_EMAIL?: string;
    ADMIN_PASSWORD?: string;
    STRIPE_SECRET_KEY?: string;
    STRIPE_WEBHOOK_SECRET?: string;
}

export const getEnvVars = (): EnvVars => {
    return {
        NODE_ENV: process.env.NODE_ENV ?? 'development',
        PORT: process.env.PORT,
        DATABASE_URL: process.env.DATABASE_URL,
        JWT_SECRET: process.env.JWT_SECRET,
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,
        CLIENT_URL: process.env.CLIENT_URL,
        ADMIN_EMAIL: process.env.ADMIN_EMAIL,
        ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
        STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY,
        STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET,
    };
};

export const requireEnv = (name: string): string => {
    const value = process.env[name];

    if (!value) {
        throw new Error(`Environment variable ${name} is required but not set.`);
    }

    return value;
};