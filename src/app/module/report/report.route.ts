import { Router } from "express";
import verifyToken from "../../middlewares/verifyToken";
import verifyModerator from "../../middlewares/verifyModerator";
import validateRequest from "../../middlewares/validateRequest";
import { ReportController } from "./report.controller";
import {
    createReportSchema,
    listReportsQuerySchema,
    reportIdParamsSchema,
} from "./report.validation";

const router = Router();

// protected (any logged-in user):
router.post("/", verifyToken, validateRequest(createReportSchema), ReportController.createReport);


// moderator or admin only:
router.get(
    "/",
    verifyToken,
    verifyModerator,
    validateRequest({ query: listReportsQuerySchema }),
    ReportController.listReports,
);

router.delete(
    "/:id",
    verifyToken,
    verifyModerator,
    validateRequest({ params: reportIdParamsSchema }),
    ReportController.deleteReport,
);

export const ReportRoute = router;
