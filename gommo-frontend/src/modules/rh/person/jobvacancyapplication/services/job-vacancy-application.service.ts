import type {
    JobVacancyApplication,
    JobVacancyApplicationCreateDto,
} from "@/modules/rh/person/jobvacancyapplication/dto/job-vacancy-application.dto";
import { BaseService } from "@/modules/root/services/base.service";
import { apiFetch } from "@/shared/lib/api.client";

class JobVacancyApplicationService extends BaseService<
    JobVacancyApplication,
    JobVacancyApplicationCreateDto,
    JobVacancyApplicationCreateDto
> {
    constructor() {
        super("/api/v1/job-vacancy-applications");
    }

    getByVacancy(jobVacancyId: string): Promise<JobVacancyApplication[]> {
        return apiFetch<JobVacancyApplication[]>(`${this.basePath}/by-vacancy/${jobVacancyId}`);
    }

    startAdmissionProcess(jobVacancyId: string): Promise<JobVacancyApplication[]> {
        return apiFetch<JobVacancyApplication[]>(
            `${this.basePath}/by-vacancy/${jobVacancyId}/start-admission-process`,
            { method: "POST" },
        );
    }

    updateKanbanColumn(id: string, kanbanColumnKey: string | null): Promise<JobVacancyApplication> {
        return apiFetch<JobVacancyApplication>(`${this.basePath}/${id}/kanban-column`, {
            method: "PATCH",
            body: { kanbanColumnKey },
        });
    }

    upsertStageComment(
        id: string,
        input: { columnKey: string; text: string },
    ): Promise<JobVacancyApplication> {
        return apiFetch<JobVacancyApplication>(`${this.basePath}/${id}/stage-comments`, {
            method: "PATCH",
            body: input,
        });
    }
}

export const jobVacancyApplicationService = new JobVacancyApplicationService();
