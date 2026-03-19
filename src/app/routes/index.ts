import { Router } from "express";
import { AuthRoute } from "../module/auth/auth.route";
import { UserRoute } from "../module/user/user.route";
import { ProductRoute } from "../module/product/product.route";
import { TagRoute } from "../module/tag/tag.route";
import { CommentRoute } from "../module/comment/comment.route";

const router = Router();

router.use("/auth", AuthRoute);

router.use("/users", UserRoute);

router.use("/products", ProductRoute);

router.use("/tags", TagRoute);

router.use("/comments", CommentRoute);



export const IndexRoutes = router;