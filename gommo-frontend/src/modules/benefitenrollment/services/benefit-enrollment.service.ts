import type { BenefitEnrollment, BenefitEnrollmentCreateDto } from "@/modules/benefitenrollment/dto/benefit-enrollment.dto";
import { BaseService } from "@/modules/root/services/base.service";

class BenefitEnrollmentService extends BaseService<BenefitEnrollment, BenefitEnrollmentCreateDto, BenefitEnrollmentCreateDto> {
    constructor() {
        super("/api/v1/benefit-enrollments");
    }
}

export const benefitEnrollmentService = new BenefitEnrollmentService();
