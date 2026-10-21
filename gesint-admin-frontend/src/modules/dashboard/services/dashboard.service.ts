import type { DashboardSummary } from "@/modules/dashboard/dto/dashboard.dto";
import { apiFetch } from "@/shared/lib/api.client";
class DashboardService {
    getSummary(): Promise<DashboardSummary> {
        return apiFetch<DashboardSummary>("/api/v1/dashboard/summary");
    }
}

export const dashboardService = new DashboardService();
