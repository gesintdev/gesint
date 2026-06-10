import type { BenefitPlan, BenefitPlanCreateDto } from "@/modules/benefit/dto/benefit-plan.dto";
import { BaseService } from "@/modules/root/services/base.service";
class BenefitPlanService extends BaseService<BenefitPlan, BenefitPlanCreateDto, BenefitPlanCreateDto> {
    constructor() {
        super("/api/v1/benefit-plans");
    }
}

export const benefitplanService = new BenefitPlanService();
