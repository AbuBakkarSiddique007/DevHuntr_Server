import bcrypt from "bcryptjs";
import { Role } from "@prisma/client";
import { prisma } from "../lib/prisma.js";

const isEnabled = () => process.env.SEED_ADMIN_ON_START === "true";

const normalizeEmail = (value: string) => value.trim().toLowerCase();

export const seedAdminIfEnabled = async () => {
  if (!isEnabled()) return;

  const emailRaw = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;
  const shouldResetPassword = process.env.SEED_ADMIN_RESET_PASSWORD === "true";

  if (!emailRaw || !password) {
    throw new Error(
      "SEED_ADMIN_ON_START is true but ADMIN_EMAIL/ADMIN_PASSWORD are missing.",
    );
  }

  const email = normalizeEmail(emailRaw);

  const existingAdmin = await prisma.user.findFirst({ where: { role: Role.ADMIN } });
  if (existingAdmin) {
    const existingAdminEmail = normalizeEmail(existingAdmin.email);
    if (existingAdminEmail !== email) return;

    if (shouldResetPassword) {
      const hashedPassword = await bcrypt.hash(password, 10);
      await prisma.user.update({
        where: { id: existingAdmin.id },
        data: { password: hashedPassword },
      });
    }

    return;
  }

  const existingByEmail = await prisma.user.findFirst({
    where: {
      email: {
        equals: email,
        mode: "insensitive",
      },
    },
  });

  const hashedPassword = await bcrypt.hash(password, 10);

  if (existingByEmail) {
    await prisma.user.update({
      where: { id: existingByEmail.id },
      data: {
        role: Role.ADMIN,
        ...(shouldResetPassword ? { password: hashedPassword } : {}),
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
