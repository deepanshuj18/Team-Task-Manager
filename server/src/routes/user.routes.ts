import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { validate } from "../middleware/validate.js";
import { asyncHandler } from "../utils/async-handler.js";
import { userListQuerySchema } from "../validations/user.validation.js";

export const userRouter = Router();

userRouter.get("/", validate({ query: userListQuerySchema }), asyncHandler(userController.listUsers));
