import type { JobVacancy, JobVacancyCreateDto } from "@/modules/rh/person/jobvacancy/dto/job-vacancy.dto";
import { BaseService } from "@/modules/root/services/base.service";

class JobVacancyService extends BaseService<JobVacancy, JobVacancyCreateDto, JobVacancyCreateDto> {
    constructor() {
        super("/api/v1/job-vacancies");
    }
}

export const jobVacancyService = new JobVacancyService();
