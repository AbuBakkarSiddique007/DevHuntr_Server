export interface CreateCouponInput {
  code: string;
  description: string;
  expiryDate: string;
  discountPercentage: number;
}

export type UpdateCouponInput = Partial<CreateCouponInput>;

