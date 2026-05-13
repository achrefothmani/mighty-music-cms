import { apiFetch } from "@/lib/api";
import { AnalyticsData } from "@/lib/types";

export async function getAnalyticsOverview(): Promise<AnalyticsData> {
  return apiFetch<AnalyticsData>("/analytics/overview");
}
