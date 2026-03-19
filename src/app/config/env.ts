import dotenv from 'dotenv';
dotenv.config();

interface EnvConfig {
    NODE_ENV: string;
    PORT: string;
    DATABASE_URL: string;
    JWT_SECRET: string;
    JWT_EXPIRES_IN?: string;

    CLIENT_URL?: string;

    ADMIN_EMAIL?: string;
    ADMIN_PASSWORD?: string;

}


const loadEnvVariables = (): EnvConfig => {

    const requireEnvVariable = [
        'NODE_ENV',
        'PORT',
        'DATABASE_URL',
        'JWT_SECRET',
    ]

    requireEnvVariable.forEach((variable) => {
        if (!process.env[variable]) {

            throw new Error(`Environment variable ${variable} is required but not set in .env file.`);
        }
    })

    return {
        NODE_ENV: process.env.NODE_ENV as string,
        PORT: process.env.PORT as string,
        DATABASE_URL: process.env.DATABASE_URL as string,
        JWT_SECRET: process.env.JWT_SECRET as string,
        JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN,

        CLIENT_URL: process.env.CLIENT_URL,

        ADMIN_EMAIL: process.env.ADMIN_EMAIL,
        ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
    }
}

export const envVars = loadEnvVariables();