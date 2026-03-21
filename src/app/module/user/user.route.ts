import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest";
import verifyAdmin from "../../middlewares/verifyAdmin";
import verifyToken from "../../middlewares/verifyToken";
import { UserController } from "./user.controller";
import {
	listUsersQuerySchema,
	updateMySubscriptionSchema,
	updateUserRoleSchema,
	userIdParamsSchema,
} from "./user.validation";

const router = Router();

router.get("/me", verifyToken, UserController.getMe);

// 
router.patch(
	"/me/subscription",
	verifyToken,
	validateRequest(updateMySubscriptionSchema),
	UserController.updateMySubscription,
);


router.get(
	"/",
	verifyToken,
	verifyAdmin,
	validateRequest({ query: listUsersQuerySchema }),
	UserController.listUsers,
);

router.patch(
	"/:id/role",
	verifyToken,
	verifyAdmin,
	validateRequest({ params: userIdParamsSchema, body: updateUserRoleSchema }),
	UserController.updateUserRole,
);

export const UserRoute = router;
