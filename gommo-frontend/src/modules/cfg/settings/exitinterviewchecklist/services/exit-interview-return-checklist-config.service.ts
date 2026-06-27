import type {
    ExitInterviewReturnChecklistConfig,
    ExitInterviewReturnChecklistConfigCreateDto,
} from "@/modules/cfg/settings/exitinterviewchecklist/dto/exit-interview-return-checklist-config.dto";
import { BaseService } from "@/modules/root/services/base.service";

class ExitInterviewReturnChecklistConfigService extends BaseService<
    ExitInterviewReturnChecklistConfig,
    ExitInterviewReturnChecklistConfigCreateDto,
    ExitInterviewReturnChecklistConfigCreateDto
> {
    constructor() {
        super("/api/v1/exit-interview-return-checklist-items");
    }
}

export const exitInterviewReturnChecklistConfigService = new ExitInterviewReturnChecklistConfigService();
