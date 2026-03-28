import { Router } from "express";
import verifyToken from "../../middlewares/verifyToken.js";
import verifyAdmin from "../../middlewares/verifyAdmin.js";
import { StatisticsController } from "./statistics.controller.js";

const router = Router();

router.get("/",
    verifyToken,
    verifyAdmin,
    StatisticsController.getStatistics);

router.get("/public",
    StatisticsController.getPublicStatistics);

router.get("/moderator",
    verifyToken,
    StatisticsController.getModeratorStatistics);

export const StatisticsRoute = router;
