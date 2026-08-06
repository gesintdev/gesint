import type { OccupationalExamIndicators } from "@/modules/rh/person/occupational-exam/dto/occupational-exam-indicators.dto";
import type {
    OccupationalExam,
    OccupationalExamCreateDto,
    OccupationalExamRegisterResultDto,
    OccupationalExamScheduleDto,
} from "@/modules/rh/person/occupational-exam/dto/occupational-exam.dto";
import { BaseService } from "@/modules/root/services/base.service";
import { apiFetch } from "@/shared/lib/api.client";

class OccupationalExamService extends BaseService<
    OccupationalExam,
    OccupationalExamCreateDto,
    OccupationalExamCreateDto
> {
    constructor() {
        super("/api/v1/occupational-exams");
    }

    indicators(): Promise<OccupationalExamIndicators> {
        return apiFetch<OccupationalExamIndicators>(`${this.basePath}/indicators`);
    }

    findDue(days = 30): Promise<OccupationalExam[]> {
        return apiFetch<OccupationalExam[]>(`${this.basePath}/due?days=${days}`);
    }

    findOverdue(): Promise<OccupationalExam[]> {
        return apiFetch<OccupationalExam[]>(`${this.basePath}/overdue`);
    }

    schedule(id: string, dto: OccupationalExamScheduleDto): Promise<OccupationalExam> {
        return apiFetch<OccupationalExam>(`${this.basePath}/${id}/schedule`, {
            method: "POST",
            body: dto,
        });
    }

    registerResult(id: string, dto: OccupationalExamRegisterResultDto): Promise<OccupationalExam> {
        return apiFetch<OccupationalExam>(`${this.basePath}/${id}/register-result`, {
            method: "POST",
            body: dto,
        });
    }
}

export const occupationalExamService = new OccupationalExamService();
