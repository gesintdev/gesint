import type {
    ExperienceDecideRequest,
    ExperienceEvaluation,
    ExperienceEvaluationCreateDto,
    ExperienceScoresUpsertRequest,
    ExperienceSummary,
} from "@/modules/rh/person/experience/dto/experience-evaluation.dto";
import { BaseService } from "@/modules/root/services/base.service";
import { apiFetch } from "@/shared/lib/api.client";

class ExperienceEvaluationService extends BaseService<
    ExperienceEvaluation,
    ExperienceEvaluationCreateDto,
    ExperienceEvaluationCreateDto
> {
    constructor() {
        super("/api/v1/experience-evaluations");
    }

    summary(): Promise<ExperienceSummary> {
        return apiFetch<ExperienceSummary>(`${this.basePath}/summary`);
    }

    listQueue(bucket: "open" | "decided" = "open"): Promise<ExperienceEvaluation[]> {
        return apiFetch<ExperienceEvaluation[]>(`${this.basePath}/queue?bucket=${bucket}`);
    }

    saveScoresDraft(id: string, body: ExperienceScoresUpsertRequest): Promise<ExperienceEvaluation> {
        return apiFetch<ExperienceEvaluation>(`${this.basePath}/${id}/scores`, {
            method: "PUT",
            body,
        });
    }

    submitScores(id: string, body: ExperienceScoresUpsertRequest): Promise<ExperienceEvaluation> {
        return apiFetch<ExperienceEvaluation>(`${this.basePath}/${id}/scores/submit`, {
            method: "POST",
            body,
        });
    }

    decide(id: string, body: ExperienceDecideRequest): Promise<ExperienceEvaluation> {
        return apiFetch<ExperienceEvaluation>(`${this.basePath}/${id}/decide`, {
            method: "POST",
            body,
        });
    }
}

export const experienceEvaluationService = new ExperienceEvaluationService();
