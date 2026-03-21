import { StatusCodes } from "http-status-codes";
import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";

import type { CreateCouponInput, UpdateCouponInput } from "./coupon.interface";

const normalizeCode = (code: string) => code.trim().toUpperCase();

const createCoupon = async (adminId: string, payload: CreateCouponInput) => {

  const code = normalizeCode(payload.code);

  const expiryDate = new Date(payload.expiryDate);

  if (Number.isNaN(expiryDate.getTime())) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Invalid expiry date");
  }


  if (expiryDate.getTime() <= Date.now()) {
    throw new AppError(StatusCodes.BAD_REQUEST, "Expiry date must be in the future");
  }


  const existing = await prisma.coupon.findUnique({
    where: {
      code
    },

    select: {
      id: true
    },
  });

  if (existing) {
    throw new AppError(StatusCodes.CONFLICT, "Coupon code already exists");
  }

  const coupon = await prisma.coupon.create({
    data: {
      code,
      description: payload.description,
      expiryDate,
      discountPercentage: payload.discountPercentage,
      createdById: adminId,
    },
    select: {
      id: true,
      code: true,
      description: true,
      expiryDate: true,
      discountPercentage: true,
      createdAt: true,
    },
  });

  return coupon;
};

const listActiveCoupons = async () => {
  const now = new Date();

  const coupons = await prisma.coupon.findMany({
    where: {
      expiryDate: {
        gt: now
      }
    },

    orderBy: {
      createdAt: "desc"
    },

    select: {
      id: true,
      code: true,
      description: true,
      expiryDate: true,
      discountPercentage: true,
    },
  });

  return coupons;
};

const validateCouponCode = async (codeInput: string) => {
  const code = normalizeCode(codeInput);

  const coupon = await prisma.coupon.findUnique({
    where: {
      code
    },

    select: {
      code: true,
      description: true,
      expiryDate: true,
      discountPercentage: true,
    },
  });


  if (!coupon) {
    return { code, isValid: false, discountPercentage: null as number | null, expiryDate: null as Date | null };
  }


  const isValid = coupon.expiryDate.getTime() > Date.now();

  return {
    code: coupon.code,
    isValid,
    discountPercentage: isValid ? coupon.discountPercentage : null,
    expiryDate: coupon.expiryDate,
    description: coupon.description,
  };
};


const updateCoupon = async (id: string, payload: UpdateCouponInput) => {
  const existing = await prisma.coupon.findUnique({
    where: {
      id

    },

    select: { id: true, code: true },
  });


  if (!existing) {
    throw new AppError(StatusCodes.NOT_FOUND, "Coupon not found");
  }

  const dataToUpdate: {
    code?: string;
    description?: string;
    expiryDate?: Date;
    discountPercentage?: number;
  } = {};

  if (payload.code !== undefined) {
    const code = normalizeCode(payload.code);

    const duplicate = await prisma.coupon.findFirst({
      where: {
        code,
        id: {
          not: id
        },

      },

      select: {
        id: true
      },
    });


    if (duplicate) {
      throw new AppError(StatusCodes.CONFLICT, "Coupon code already exists");
    }

    dataToUpdate.code = code;
  }

  if (payload.description !== undefined) {
    dataToUpdate.description = payload.description;
  }

  if (payload.discountPercentage !== undefined) {
    dataToUpdate.discountPercentage = payload.discountPercentage;
  }

  if (payload.expiryDate !== undefined) {
    const expiryDate = new Date(payload.expiryDate);

    if (Number.isNaN(expiryDate.getTime())) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Invalid expiry date");
    }

    if (expiryDate.getTime() <= Date.now()) {
      throw new AppError(StatusCodes.BAD_REQUEST, "Expiry date must be in the future");
    }

    dataToUpdate.expiryDate = expiryDate;
  }

  const updated = await prisma.coupon.update({
    where: { id },
    data: dataToUpdate,
    select: {
      id: true,
      code: true,
      description: true,
      expiryDate: true,
      discountPercentage: true,
      updatedAt: true,
    },
  });

  return updated;
};

const deleteCoupon = async (id: string) => {
  const existing = await prisma.coupon.findUnique({
    where: {
      id
    },

    select: {
      id: true
    },
  });


  if (!existing) {
    throw new AppError(StatusCodes.NOT_FOUND, "Coupon not found");
  }

  await prisma.coupon.delete({
    where: {
      id
    }
  });

  return null;
};

export const CouponServer = {
  createCoupon,
  listActiveCoupons,
  validateCouponCode,
  updateCoupon,
  deleteCoupon,
};
