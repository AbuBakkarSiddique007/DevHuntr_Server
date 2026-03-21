import { Router } from "express";
import verifyToken from "../../middlewares/verifyToken";
import verifyModerator from "../../middlewares/verifyModerator";
import verifyAdmin from "../../middlewares/verifyAdmin";
import validateRequest from "../../middlewares/validateRequest";
import { ReportController } from "./report.controller";
import {
    createReportSchema,
    listReportsQuerySchema,
    reportIdParamsSchema,
    updateReportStatusSchema,
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

router.patch(
    "/:id/status",
    verifyToken,
    verifyModerator,
    validateRequest({ params: reportIdParamsSchema, body: updateReportStatusSchema }),
    ReportController.updateReportStatus,
);

router.delete(
    "/:id",
    verifyToken,
    verifyAdmin,
    validateRequest({ params: reportIdParamsSchema }),
    ReportController.deleteReport,
);

export const ReportRoute = router;
