import type { BenefitEnrollment, BenefitEnrollmentCreateDto } from "@/modules/benefitenrollment/dto/benefit-enrollment.dto";

export function benefitEnrollmentToFormDto(entity: BenefitEnrollment): BenefitEnrollmentCreateDto {
    return {
        collaboratorId: entity.collaboratorId ?? "",
        benefitPlanId: entity.benefitPlanId ?? "",
        startDate: entity.startDate?.slice(0, 10) ?? "",
        endDate: entity.endDate?.slice(0, 10) ?? "",
        monthlyValue: entity.monthlyValue != null ? String(entity.monthlyValue) : "",
        notes: entity.notes ?? "",
    };
}

export const emptyBenefitEnrollmentForm = (): BenefitEnrollmentCreateDto => ({
    collaboratorId: "",
    benefitPlanId: "",
    startDate: "",
    endDate: "",
    monthlyValue: "",
    notes: "",
});
