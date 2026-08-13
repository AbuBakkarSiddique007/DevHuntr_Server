import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

const isEnabled = () => process.env.SEED_ADMIN_ON_START === "true";

const normalizeEmail = (value: string) => value.trim().toLowerCase();

export const seedAdminIfEnabled = async () => {
  if (!isEnabled()) return;

  try {
    const shouldResetPassword = process.env.SEED_ADMIN_RESET_PASSWORD === "true";

    const demoAccounts = [
      { name: "Demo User", email: "user1@gmail.com", password: "password123", role: Role.USER },
      { name: "Demo Moderator", email: "moderator@gmail.com", password: "password123", role: Role.MODERATOR },
      { name: "Demo Admin", email: process.env.ADMIN_EMAIL || "devadmin@gmail.com", password: process.env.ADMIN_PASSWORD || "Admin12345", role: Role.ADMIN },
    ];

    for (const account of demoAccounts) {
      const email = normalizeEmail(account.email);
      const existing = await prisma.user.findFirst({
        where: { email: { equals: email, mode: "insensitive" } },
      });

      const hashedPassword = await bcrypt.hash(account.password, 10);

      if (!existing) {
        await prisma.user.create({
          data: {
            name: account.name,
            email,
            password: hashedPassword,
            role: account.role,
          },
        });
      } else if (shouldResetPassword) {
        await prisma.user.update({
          where: { id: existing.id },
          data: {
            password: hashedPassword,
            role: account.role,
          },
        });
      }
    }
  } catch (err) {
    console.warn("Demo account seeding notice:", err);
  }
};
