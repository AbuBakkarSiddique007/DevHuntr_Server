import { Router } from "express";
import { AuthRoute } from "../module/auth/auth.route";

const router = Router();

router.use("/auth", AuthRoute);



export const IndexRoutes = router;

