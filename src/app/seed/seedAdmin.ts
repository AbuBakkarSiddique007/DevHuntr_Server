import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { getEnvVars } from "../config/env.js";
import { prisma } from "../lib/prisma.js";

export const seedAdmin = async () => {
    try {
        const { ADMIN_EMAIL: email, ADMIN_PASSWORD: password } = getEnvVars();

        if (!email || !password) {
            console.error(
                "ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env before seeding an admin.",
            );
            process.exitCode = 1;
            return;
        }

        const result = await prisma.$transaction(async (tx) => {
            const userByEmail = await tx.user.findUnique({ where: { email } });

            const hashedPassword = await bcrypt.hash(password, 10);

            if (userByEmail) {
                const updated = await tx.user.update({
                    where: { email },
                    data: {
                        role: Role.ADMIN,
                        password: hashedPassword,
                    },
                });

                return { action: "updated" as const, user: updated };
            }

            const existingAdmin = await tx.user.findFirst({ where: { role: Role.ADMIN } });
            if (existingAdmin) {
                return { action: "skipped" as const, user: existingAdmin };
            }

            const created = await tx.user.create({
                data: {
                    name: "Admin",
                    email,
                    password: hashedPassword,
                    role: Role.ADMIN,
                },
            });

            return { action: "created" as const, user: created };
        });

        if (result.action === "skipped") {
            console.log("Admin already exists. Skipping seeding.");
            return;
        }

        console.log(`Admin ${result.action}:`, {
            id: result.user.id,
            email: result.user.email,
            role: result.user.role,
        });

    } catch (error) {
        console.error("Error seeding admin:", error);
        process.exitCode = 1;
        
    } finally {
        await prisma.$disconnect();
    }
};

seedAdmin();
