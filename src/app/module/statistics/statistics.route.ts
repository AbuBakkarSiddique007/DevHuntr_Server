import { Router } from "express";
import verifyToken from "../../middlewares/verifyToken";
import verifyAdmin from "../../middlewares/verifyAdmin";
import { StatisticsController } from "./statistics.controller";

const router = Router();

router.get("/",
    verifyToken,
    verifyAdmin,
    StatisticsController.getStatistics);

export const StatisticsRoute = router;
