import type {
    ExitInterview,
    ExitInterviewCancelDto,
    ExitInterviewCreateDto,
} from "@/modules/rh/person/exitinterview/dto/exit-interview.dto";
import { BaseService } from "@/modules/root/services/base.service";
import { apiFetch } from "@/shared/lib/api.client";

class ExitInterviewService extends BaseService<ExitInterview, ExitInterviewCreateDto, ExitInterviewCreateDto> {
    constructor() {
        super("/api/v1/exit-interviews");
    }
    complete(id: string): Promise<ExitInterview> {
        return apiFetch<ExitInterview>(`${this.basePath}/${id}/complete`, { method: "POST" });
    }
    cancel(id: string, dto: ExitInterviewCancelDto = {}): Promise<ExitInterview> {
        return apiFetch<ExitInterview>(`${this.basePath}/${id}/cancel`, { method: "POST", body: dto });
    }
}

export const exitinterviewService = new ExitInterviewService();
