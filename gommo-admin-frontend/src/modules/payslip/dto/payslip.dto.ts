export class Payslip {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    payrollRunId!: string;
    collaboratorId!: string;
    grossAmount!: string;
    netAmount!: string;
    createdAt?: string;
    updatedAt?: string;
}

export class PayslipCreateDto {
    payrollRunId!: string;
    collaboratorId!: string;
    grossAmount?: string;
    netAmount?: string;
}
