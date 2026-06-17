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
    referenceDate!: string;
    payrollStatus?: PayrollStatus;
    openedAt?: string;
    closedAt?: string;
    processedAt?: string;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class PayrollRunCreateDto {
    referenceDate!: string;
    payrollStatus?: PayrollStatus;
    openedAt?: string;
    closedAt?: string;
    processedAt?: string;
    notes?: string;
}
