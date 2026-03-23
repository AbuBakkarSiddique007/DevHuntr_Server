import { Router } from "express";
import verifyToken from "../../middlewares/verifyToken.js";
import verifyAdmin from "../../middlewares/verifyAdmin.js";
import { StatisticsController } from "./statistics.controller.js";

const router = Router();

router.get("/",
    verifyToken,
    verifyAdmin,
    StatisticsController.getStatistics);

export const StatisticsRoute = router;
