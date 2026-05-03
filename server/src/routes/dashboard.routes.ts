import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller.js";
import { asyncHandler } from "../utils/async-handler.js";

export const dashboardRouter = Router();

dashboardRouter.get("/summary", asyncHandler(dashboardController.getSummary));
