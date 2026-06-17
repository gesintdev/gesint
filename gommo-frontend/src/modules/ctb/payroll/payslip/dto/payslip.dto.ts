export class Payslip {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    payrollRunId!: string;
    collaboratorId!: string;
    baseSalary?: string;
    grossAmount!: string;
    deductionsAmount?: string;
    netAmount!: string;
    generatedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class PayslipCreateDto {
    payrollRunId!: string;
    collaboratorId!: string;
    baseSalary?: string;
    grossAmount?: string;
    deductionsAmount?: string;
    netAmount?: string;
    generatedAt?: string;
}
