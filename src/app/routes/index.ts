import { Router } from "express";
import { AuthRoute } from "../module/auth/auth.route.js";
import { UserRoute } from "../module/user/user.route.js";
import { ProductRoute } from "../module/product/product.route.js";
import { TagRoute } from "../module/tag/tag.route.js";
import { CommentRoute } from "../module/comment/comment.route.js";
import { VoteRoute } from "../module/vote/vote.route.js";
import { ReportRoute } from "../module/report/report.route.js";
import { StatisticsRoute } from "../module/statistics/statistics.route.js";
import { CouponRoute } from "../module/coupon/coupon.route.js";
import { PaymentRoute } from "../module/payment/payment.route.js";

const router = Router();

router.use("/auth", AuthRoute);

router.use("/users", UserRoute);

router.use("/products", ProductRoute);

router.use("/tags", TagRoute);

router.use("/comments", CommentRoute);

router.use("/votes", VoteRoute);

router.use("/reports", ReportRoute);

router.use("/statistics", StatisticsRoute);

router.use("/coupons", CouponRoute);

router.use("/payments", PaymentRoute);



export const IndexRoutes = router;