import { Router } from "express";
import { AuthRoute } from "../module/auth/auth.route";
import { UserRoute } from "../module/user/user.route";
import { ProductRoute } from "../module/product/product.route";
import { TagRoute } from "../module/tag/tag.route";
import { CommentRoute } from "../module/comment/comment.route";
import { VoteRoute } from "../module/vote/vote.route";
import { ReportRoute } from "../module/report/report.route";
import { StatisticsRoute } from "../module/statistics/statistics.route";

const router = Router();

router.use("/auth", AuthRoute);

router.use("/users", UserRoute);

router.use("/products", ProductRoute);

router.use("/tags", TagRoute);

router.use("/comments", CommentRoute);

router.use("/votes", VoteRoute);

router.use("/reports", ReportRoute);

router.use("/statistics", StatisticsRoute);



export const IndexRoutes = router;