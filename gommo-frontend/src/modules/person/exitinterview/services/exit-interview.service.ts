import type { ExitInterview, ExitInterviewCreateDto } from "@/modules/person/exitinterview/dto/exit-interview.dto";
import { BaseService } from "@/modules/root/services/base.service";

class ExitInterviewService extends BaseService<ExitInterview, ExitInterviewCreateDto, ExitInterviewCreateDto> {
    constructor() {
        super("/api/v1/exit-interviews");
    }
}

export const exitinterviewService = new ExitInterviewService();
