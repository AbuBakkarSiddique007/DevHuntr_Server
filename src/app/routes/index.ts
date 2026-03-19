import { Router } from "express";
import { AuthRoute } from "../module/auth/auth.route";
import { UserRoute } from "../module/user/user.route";

const router = Router();

router.use("/auth", AuthRoute);

router.use("/users", UserRoute);



export const IndexRoutes = router;