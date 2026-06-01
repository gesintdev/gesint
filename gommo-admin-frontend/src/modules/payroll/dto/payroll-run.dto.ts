export class PayrollRun {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    referenceYear!: number;
    referenceMonth!: number;
    payrollStatus?: "DRAFT" | "PROCESSING" | "CLOSED" | "CANCELLED";
    createdAt?: string;
    updatedAt?: string;
}

export class PayrollRunCreateDto {
    referenceYear!: number;
    referenceMonth!: number;
    payrollStatus?: "DRAFT" | "PROCESSING" | "CLOSED" | "CANCELLED";
}
