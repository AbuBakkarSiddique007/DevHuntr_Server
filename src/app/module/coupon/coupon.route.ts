import { Router } from "express";
import verifyToken from "../../middlewares/verifyToken";
import verifyAdmin from "../../middlewares/verifyAdmin";
import validateRequest from "../../middlewares/validateRequest";
import { CouponController } from "./coupon.controller";
import {
	couponIdParamsSchema,
	createCouponSchema,
	updateCouponSchema,
	validateCodeParamsSchema,
} from "./coupon.validation";

const router = Router();

// public
router.get("/",
	CouponController.listActiveCoupons);

router.get("/validate/:code",
	validateRequest({ params: validateCodeParamsSchema }),
	CouponController.validateCoupon);


// admin
router.post("/",
	verifyToken,
	verifyAdmin,
	validateRequest(createCouponSchema),
	CouponController.createCoupon);


router.patch(
	"/:id",
	verifyToken,
	verifyAdmin,
	validateRequest({ params: couponIdParamsSchema, body: updateCouponSchema }),
	CouponController.updateCoupon,
);

router.delete(
	"/:id",
	verifyToken,
	verifyAdmin,
	validateRequest({ params: couponIdParamsSchema }),
	CouponController.deleteCoupon,
);

export const CouponRoute = router;
