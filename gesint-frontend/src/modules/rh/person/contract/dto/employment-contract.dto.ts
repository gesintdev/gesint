export class EmploymentContract {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    collaboratorId!: string;
    contractType?: "CLT" | "PJ" | "INTERMITTENT" | "APPRENTICE" | "INTERN";
    startDate!: string;
    endDate?: string;
    baseSalary!: string;
    createdAt?: string;
    updatedAt?: string;
}

export class EmploymentContractCreateDto {
    collaboratorId!: string;
    contractType?: "CLT" | "PJ" | "INTERMITTENT" | "APPRENTICE" | "INTERN";
    startDate!: string;
    endDate?: string;
    baseSalary?: string;
}
