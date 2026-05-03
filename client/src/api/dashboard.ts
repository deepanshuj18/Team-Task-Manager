import { http } from "./http";
import type { DashboardSummary } from "../types";

export async function fetchDashboardSummary() {
  const { data } = await http.get<{ summary: DashboardSummary }>("/dashboard/summary");
  return data.summary;
}
