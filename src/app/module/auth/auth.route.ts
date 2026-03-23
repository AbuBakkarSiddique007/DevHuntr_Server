import { Router } from "express";
import validateRequest from "../../middlewares/validateRequest.js";
import { AuthController } from "./auth.controller.js";
import { loginSchema, registerSchema } from "./auth.validation.js";

const router = Router();

router.post("/register", validateRequest(registerSchema), AuthController.register);

router.post("/login", validateRequest(loginSchema), AuthController.login);

router.post("/logout", AuthController.logout);

export const AuthRoute = router;