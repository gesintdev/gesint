import type { DevelopmentPlan, DevelopmentPlanCreateDto } from "@/modules/rh/person/developmentplan/dto/development-plan.dto";
import { BaseService } from "@/modules/root/services/base.service";
import { apiFetch } from "@/shared/lib/api.client";

class DevelopmentPlanService extends BaseService<DevelopmentPlan, DevelopmentPlanCreateDto, DevelopmentPlanCreateDto> {
    constructor() {
        super("/api/v1/development-plans");
    }

    submitForApproval(id: string) {
        return apiFetch<DevelopmentPlan>(`${this.basePath}/${id}/submit-for-approval`, { method: "POST" });
    }

    approve(id: string) {
        return apiFetch<DevelopmentPlan>(`${this.basePath}/${id}/approve`, { method: "POST" });
    }

    conclude(id: string) {
        return apiFetch<DevelopmentPlan>(`${this.basePath}/${id}/conclude`, { method: "POST" });
    }

    cancel(id: string, reason: string) {
        return apiFetch<DevelopmentPlan>(`${this.basePath}/${id}/cancel`, { method: "POST", body: { reason } });
    }
}

export const developmentPlanService = new DevelopmentPlanService();