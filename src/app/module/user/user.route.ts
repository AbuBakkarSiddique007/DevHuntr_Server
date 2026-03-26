import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest.js";
import verifyAdmin from "../../middlewares/verifyAdmin.js";
import verifyToken from "../../middlewares/verifyToken.js";
import { UserController } from "./user.controller.js";
import {
	listUsersQuerySchema,
	updateMySubscriptionSchema,
	updateUserRoleSchema,
	userIdParamsSchema,
} from "./user.validation.js";

const router = Router();

router.get("/me", verifyToken, UserController.getMe);

router.patch(
	"/me/subscription",
	verifyToken,
	validateRequest(updateMySubscriptionSchema),
	UserController.updateMySubscription,
);

router.patch(
	"/update-profile",
	verifyToken,
	UserController.updateProfile,
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
