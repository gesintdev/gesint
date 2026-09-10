import type {
    ExamRequirement,
    ExamRequirementCreateDto,
} from "@/modules/dp/occupational-exam/exam-requirement/dto/exam-requirement.dto";
import { BaseService } from "@/modules/root/services/base.service";
import { apiFetch } from "@/shared/lib/api.client";

class ExamRequirementService extends BaseService<ExamRequirement, ExamRequirementCreateDto, ExamRequirementCreateDto> {
    constructor() {
        super("/api/v1/exam-requirements");
    }

    findByJobPositionId(jobPositionId: string): Promise<ExamRequirement[]> {
        return apiFetch<ExamRequirement[]>(`${this.basePath}/by-job-position/${jobPositionId}`);
    }
}

export const examRequirementService = new ExamRequirementService();
