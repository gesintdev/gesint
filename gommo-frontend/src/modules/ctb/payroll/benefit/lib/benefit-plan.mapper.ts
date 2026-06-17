import type { BenefitPlan, BenefitPlanCreateDto } from "@/modules/ctb/payroll/benefit/dto/benefit-plan.dto";

export function benefitplanToFormDto(entity: BenefitPlan): BenefitPlanCreateDto {
    return {
        name: entity.name ?? "",
        benefitType: entity.benefitType ?? "",
        monthlyValue: entity.monthlyValue != null ? String(entity.monthlyValue) : "",
        description: entity.description ?? "",
        startDate: entity.startDate ?? "",
        endDate: entity.endDate ?? "",
    };
}

export const emptyBenefitPlanForm = (): BenefitPlanCreateDto => ({
    name: "",
    benefitType: "",
    monthlyValue: "",
    description: "",
    startDate: "",
    endDate: "",
});
