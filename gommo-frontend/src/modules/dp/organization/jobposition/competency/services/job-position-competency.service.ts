import type {
    JobPositionCompetency,
    JobPositionCompetencyCreateDto,
} from "@/modules/dp/organization/jobposition/competency/dto/job-position-competency.dto";
import { BaseService } from "@/modules/root/services/base.service";
import { apiFetch } from "@/shared/lib/api.client";

class JobPositionCompetencyService extends BaseService<
    JobPositionCompetency,
    JobPositionCompetencyCreateDto,
    JobPositionCompetencyCreateDto
> {
    constructor() {
        super("/api/v1/job-position-competencies");
    }

    findByJobPositionId(jobPositionId: string): Promise<JobPositionCompetency[]> {
        return apiFetch<JobPositionCompetency[]>(`${this.basePath}/by-job-position/${jobPositionId}`);
    }
}

export const jobPositionCompetencyService = new JobPositionCompetencyService();
