import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

const isEnabled = () => process.env.SEED_ADMIN_ON_START === "true";

export const seedAdminIfEnabled = async () => {
  if (!isEnabled()) return;

  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    throw new Error(
      "SEED_ADMIN_ON_START is true but ADMIN_EMAIL/ADMIN_PASSWORD are missing.",
    );
  }

  const existingAdmin = await prisma.user.findFirst({ where: { role: Role.ADMIN } });
  if (existingAdmin) return;

  const existingByEmail = await prisma.user.findUnique({ where: { email } });

  const hashedPassword = await bcrypt.hash(password, 10);

  if (existingByEmail) {
    await prisma.user.update({
      where: { email },
      data: {
        role: Role.ADMIN,
        ...(process.env.SEED_ADMIN_RESET_PASSWORD === "true" ? { password: hashedPassword } : {}),
      },
    });
    return;
  }

  await prisma.user.create({
    data: {
      name: "Admin",
      email,
      password: hashedPassword,
      role: Role.ADMIN,
    },
  });
};
