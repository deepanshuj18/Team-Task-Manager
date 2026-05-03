import type { Request, Response } from "express";
import * as dashboardService from "../services/dashboard.service.js";

export async function getSummary(request: Request, response: Response) {
  const summary = await dashboardService.getDashboardSummary(request.user!);
  response.json({ summary });
}
