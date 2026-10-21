export type JobPositionSalaryLevel = "I" | "II" | "III";

export class JobPositionSalaryTableItem {
    id?: string;
    level!: JobPositionSalaryLevel;
    minSalary!: number;
    referenceSalary!: number;
    maxSalary!: number;
}

export class JobPositionSalaryTable {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    jobPositionId!: string;
    companyId?: string | null;
    name?: string | null;
    versionNumber!: number;
    validFrom!: string;
    validUntil?: string | null;
    items!: JobPositionSalaryTableItem[];
    createdAt?: string;
    updatedAt?: string;
}

export class JobPositionSalaryTableItemFormDto {
    level!: JobPositionSalaryLevel;
    minSalary!: string;
    referenceSalary!: string;
    maxSalary!: string;
}

export class JobPositionSalaryTableCreateDto {
    jobPositionId!: string;
    name?: string;
    validFrom!: string;
    items!: JobPositionSalaryTableItemFormDto[];
}
