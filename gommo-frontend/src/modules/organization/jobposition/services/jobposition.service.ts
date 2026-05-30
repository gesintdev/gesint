import type { JobPosition, JobPositionCreateDto } from "@/modules/organization/jobposition/dto/jobposition.dto";
import { BaseService } from "@/modules/root/services/base.service";

class JobPositionService extends BaseService<JobPosition, JobPositionCreateDto, JobPositionCreateDto> {
    constructor() {
        super("/api/v1/job-positions");
    }
}

export const jobpositionService = new JobPositionService();
