import type {
    JobPositionSalaryTable,
    JobPositionSalaryTableCreateDto,
} from "@/modules/dp/organization/jobposition/salarytable/dto/job-position-salary-table.dto";
import { BaseService } from "@/modules/root/services/base.service";
import { apiFetch } from "@/shared/lib/api.client";

class JobPositionSalaryTableService extends BaseService<
    JobPositionSalaryTable,
    JobPositionSalaryTableCreateDto,
    JobPositionSalaryTableCreateDto
> {
    constructor() {
        super("/api/v1/job-position-salary-tables");
    }

    findByJobPositionId(jobPositionId: string): Promise<JobPositionSalaryTable[]> {
        return apiFetch<JobPositionSalaryTable[]>(`${this.basePath}/by-job-position/${jobPositionId}`);
    }

    findCurrentByJobPositionId(jobPositionId: string): Promise<JobPositionSalaryTable | null> {
        return apiFetch<JobPositionSalaryTable | null>(
            `${this.basePath}/by-job-position/${jobPositionId}/current`,
        );
    }
}

export const jobPositionSalaryTableService = new JobPositionSalaryTableService();
