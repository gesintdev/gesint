export class PayslipEntry {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    payslipId!: string;
    payrollEventId!: string;
    quantity!: string;
    unitValue!: string;
    totalValue!: string;
    createdAt?: string;
    updatedAt?: string;
}

export class PayslipEntryCreateDto {
    payslipId!: string;
    payrollEventId!: string;
    quantity?: string;
    unitValue?: string;
    totalValue?: string;
}
