export type PayrollStatus =
    | "OPEN"
    | "PROCESSING"
    | "PROCESSED"
    | "REVIEWED"
    | "CLOSED"
    | "CANCELLED"
    | "DRAFT";

export class PayrollRun {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    companyId?: string;
    referenceYear!: number;
    referenceMonth!: number;
    payrollStatus?: PayrollStatus;
    openedAt?: string;
    closedAt?: string;
    processedAt?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class PayrollRunCreateDto {
    companyId?: string;
    referenceYear!: number;
    referenceMonth!: number;
    payrollStatus?: PayrollStatus;
    openedAt?: string;
    closedAt?: string;
    processedAt?: string;
    notes?: string;
}
