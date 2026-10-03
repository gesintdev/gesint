import type {
    JobVacancyCompetency,
    JobVacancyCompetencyCreateDto,
} from "@/modules/rh/person/jobvacancy/competency/dto/job-vacancy-competency.dto";
import { BaseService } from "@/modules/root/services/base.service";
import { apiFetch } from "@/shared/lib/api.client";

class JobVacancyCompetencyService extends BaseService<
    JobVacancyCompetency,
    JobVacancyCompetencyCreateDto,
    JobVacancyCompetencyCreateDto
> {
    constructor() {
        super("/api/v1/job-vacancy-competencies");
    }

    findByJobVacancyId(jobVacancyId: string): Promise<JobVacancyCompetency[]> {
        return apiFetch<JobVacancyCompetency[]>(`${this.basePath}/by-job-vacancy/${jobVacancyId}`);
    }
}

export const jobVacancyCompetencyService = new JobVacancyCompetencyService();
