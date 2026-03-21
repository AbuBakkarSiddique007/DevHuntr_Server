import { StatusCodes } from "http-status-codes";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";

const listUsers = async (page = 1, limit = 10) => {
  const skip = (page - 1) * limit;

  const [total, users] = await Promise.all([
    prisma.user.count(),
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        photoUrl: true,
        role: true,
        isSubscribed: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
  ]);

  return {
    meta: { page, limit, total },
    users,
  };
};

const getMe = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });

  if (!user) {
    throw new AppError(StatusCodes.NOT_FOUND, "User not found");
  }

  const { password: _password, ...userWithoutPassword } = user;
  void _password;

  return userWithoutPassword;
};

const updateUserRole = async (id: string, role: "USER" | "MODERATOR" | "ADMIN") => {
  const user = await prisma.user.update({
    where: { id },
    data: { role },
  });

  const { password: _password, ...userWithoutPassword } = user;
  void _password;
  return userWithoutPassword;
};

const updateMySubscription = async (userId: string, isSubscribed: boolean) => {

  const user = await prisma.user.update({
    where: {
      id: userId
    },

    data: {
      isSubscribed
    },

  });

  const { password: _password, ...userWithoutPassword } = user;
  void _password;
  return userWithoutPassword;
};

export const UserServer = {
  listUsers,
  getMe,
  updateMySubscription,
  updateUserRole,
};
