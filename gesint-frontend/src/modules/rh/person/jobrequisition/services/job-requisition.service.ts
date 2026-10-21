import type {
    JobRequisition,
    JobRequisitionCreateDto,
    JobRequisitionRejectDto,
} from "@/modules/rh/person/jobrequisition/dto/job-requisition.dto";
import { BaseService } from "@/modules/root/services/base.service";
import { apiFetch } from "@/shared/lib/api.client";

class JobRequisitionService extends BaseService<JobRequisition, JobRequisitionCreateDto, JobRequisitionCreateDto> {
    constructor() {
        super("/api/v1/job-requisitions");
    }

    submitForApproval(id: string): Promise<JobRequisition> {
        return apiFetch<JobRequisition>(`${this.basePath}/${id}/submit-for-approval`, { method: "POST" });
    }

    approve(id: string): Promise<JobRequisition> {
        return apiFetch<JobRequisition>(`${this.basePath}/${id}/approve`, { method: "POST" });
    }

    reject(id: string, dto: JobRequisitionRejectDto): Promise<JobRequisition> {
        return apiFetch<JobRequisition>(`${this.basePath}/${id}/reject`, { method: "POST", body: dto });
    }

    cancel(id: string): Promise<JobRequisition> {
        return apiFetch<JobRequisition>(`${this.basePath}/${id}/cancel`, { method: "POST" });
    }
}

export const jobRequisitionService = new JobRequisitionService();
