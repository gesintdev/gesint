import type {
    InterviewScorecard,
    InterviewScorecardUpsertDto,
} from "@/modules/rh/person/jobvacancyapplication/dto/interview-scorecard.dto";
import type {
    JobVacancyApplicationHirePreview,
    JobVacancyApplicationHireRequest,
    JobVacancyApplicationHireResponse,
} from "@/modules/rh/person/jobvacancyapplication/dto/job-vacancy-application-hire.dto";
import type {
    JobVacancyApplication,
    JobVacancyApplicationCreateDto,
    JobVacancyApplicationRejectDto,
    JobVacancyApplicationRejectionReason,
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

    reanalyze(id: string): Promise<JobVacancyApplication> {
        return apiFetch<JobVacancyApplication>(`${this.basePath}/${id}/reanalyze`, {
            method: "POST",
        });
    }

    getRejectionReasons(): Promise<JobVacancyApplicationRejectionReason[]> {
        return apiFetch<JobVacancyApplicationRejectionReason[]>(`${this.basePath}/rejection-reasons`);
    }

    reject(id: string, dto: JobVacancyApplicationRejectDto): Promise<JobVacancyApplication> {
        return apiFetch<JobVacancyApplication>(`${this.basePath}/${id}/reject`, {
            method: "POST",
            body: dto,
        });
    }

    getInterviewScorecard(id: string, columnKey: string): Promise<InterviewScorecard> {
        const params = new URLSearchParams({ columnKey });
        return apiFetch<InterviewScorecard>(`${this.basePath}/${id}/interview-scorecard?${params}`);
    }

    saveInterviewScorecardDraft(id: string, dto: InterviewScorecardUpsertDto): Promise<InterviewScorecard> {
        return apiFetch<InterviewScorecard>(`${this.basePath}/${id}/interview-scorecard`, {
            method: "PUT",
            body: dto,
        });
    }

    submitInterviewScorecard(id: string, dto: InterviewScorecardUpsertDto): Promise<InterviewScorecard> {
        return apiFetch<InterviewScorecard>(`${this.basePath}/${id}/interview-scorecard/submit`, {
            method: "POST",
            body: dto,
        });
    }

    getHirePreview(id: string): Promise<JobVacancyApplicationHirePreview> {
        return apiFetch<JobVacancyApplicationHirePreview>(`${this.basePath}/${id}/hire-preview`);
    }

    hire(id: string, dto: JobVacancyApplicationHireRequest): Promise<JobVacancyApplicationHireResponse> {
        return apiFetch<JobVacancyApplicationHireResponse>(`${this.basePath}/${id}/hire`, {
            method: "POST",
            body: dto,
        });
    }
}

export const jobVacancyApplicationService = new JobVacancyApplicationService();
