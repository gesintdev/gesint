export class BenefitPlan {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    name!: string;
    benefitType!: string;
    monthlyValue!: string;
    createdAt?: string;
    updatedAt?: string;
}

export class BenefitPlanCreateDto {
    name!: string;
    benefitType!: string;
    monthlyValue?: string;
}
