export class Payslip {
    id!: string;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    payrollRunId!: string;
    collaboratorId!: string;
    grossAmount!: string;
    deductionsAmount?: string;
    netAmount!: string;
    createdAt?: string;
    updatedAt?: string;
}

export class PayslipCreateDto {
    payrollRunId!: string;
    collaboratorId!: string;
    grossAmount?: string;
    deductionsAmount?: string;
    netAmount?: string;
}
