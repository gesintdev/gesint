export class BenefitEnrollment {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    collaboratorId!: string;
    benefitPlanId!: string;
    startDate!: string;
    endDate?: string;
    monthlyValue?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class BenefitEnrollmentCreateDto {
    collaboratorId!: string;
    benefitPlanId!: string;
    startDate!: string;
    endDate?: string;
    monthlyValue?: string;
    notes?: string;
}
