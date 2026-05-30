export class BenefitPlan {
    id!: string;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    name!: string;
    benefitType!: string;
    monthlyValue?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class BenefitPlanCreateDto {
    name!: string;
    benefitType!: string;
    monthlyValue?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
}
