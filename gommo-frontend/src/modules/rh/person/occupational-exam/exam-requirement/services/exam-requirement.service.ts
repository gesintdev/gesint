import type {
    ExamRequirement,
    ExamRequirementCreateDto,
} from "@/modules/rh/person/occupational-exam/exam-requirement/dto/exam-requirement.dto";
import { BaseService } from "@/modules/root/services/base.service";

class ExamRequirementService extends BaseService<ExamRequirement, ExamRequirementCreateDto, ExamRequirementCreateDto> {
    constructor() {
        super("/api/v1/exam-requirements");
    }
}

export const examRequirementService = new ExamRequirementService();
