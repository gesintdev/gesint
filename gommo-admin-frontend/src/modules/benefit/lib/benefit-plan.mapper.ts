import type { BenefitPlan, BenefitPlanCreateDto } from "@/modules/benefit/dto/benefit-plan.dto";

export function benefitplanToFormDto(entity: BenefitPlan): BenefitPlanCreateDto {
    return {
        name: entity.name ?? "",
        benefitType: entity.benefitType ?? "",
        monthlyValue: entity.monthlyValue != null ? String(entity.monthlyValue) : "",
    };
}

export const emptyBenefitPlanForm = (): BenefitPlanCreateDto => ({
    name: "",
    benefitType: "",
    monthlyValue: "",
});
