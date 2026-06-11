export class PayrollRun {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    referenceDate!: string;
    payrollStatus?: "DRAFT" | "PROCESSING" | "CLOSED" | "CANCELLED";
    createdAt?: string;
    updatedAt?: string;
}

export class PayrollRunCreateDto {
    referenceDate!: string;
    payrollStatus?: "DRAFT" | "PROCESSING" | "CLOSED" | "CANCELLED";
}
