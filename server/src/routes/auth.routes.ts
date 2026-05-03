import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/async-handler.js";
import { loginSchema, signupSchema } from "../validations/auth.validation.js";

export const authRouter = Router();

authRouter.post("/signup", validate({ body: signupSchema }), asyncHandler(authController.signup));
authRouter.post("/login", validate({ body: loginSchema }), asyncHandler(authController.login));
authRouter.post("/logout", asyncHandler(authController.logout));
authRouter.get("/me", authenticate, asyncHandler(authController.me));
