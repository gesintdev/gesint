import type { LeaveRequest, LeaveRequestCreateDto } from "@/modules/rh/person/leave/dto/leave-request.dto";
import { BaseService } from "@/modules/root/services/base.service";
import { apiFetch } from "@/shared/lib/api.client";

export type VacationAbsenceSummary = {
    unjustifiedAbsences: number;
    justifiedAbsences: number;
};

export type VacationReviewAction = "APPROVE" | "RETURN" | "REJECT";

export type VacationReviewRequest = {
    action: VacationReviewAction;
    reason?: string;
};

class LeaveRequestService extends BaseService<LeaveRequest, LeaveRequestCreateDto, LeaveRequestCreateDto> {
    constructor() {
        super("/api/v1/leave-requests");
    }

    async absenceSummary(
        collaboratorId: string,
        acquisitionStart: string,
        acquisitionEnd: string,
    ): Promise<VacationAbsenceSummary> {
        const params = new URLSearchParams({
            collaboratorId,
            acquisitionStart,
            acquisitionEnd,
        });
        return apiFetch<VacationAbsenceSummary>(`${this.basePath}/vacation/absence-summary?${params}`);
    }

    async reviewVacation(id: string, payload: VacationReviewRequest): Promise<LeaveRequest> {
        return apiFetch<LeaveRequest>(`${this.basePath}/${id}/vacation-review`, {
            method: "POST",
            body: payload,
        });
    }
}

export const leaverequestService = new LeaveRequestService();
