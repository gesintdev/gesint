export type JobPositionNature = "OPERATIONAL" | "TECHNICAL" | "SPECIALIST" | "LEADERSHIP" | "EXECUTIVE";

export class JobPosition {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    sharedAcrossBranches?: boolean;
    companyId?: string | null;
    title!: string;
    cboCode!: string;
    departmentId!: string;
    nature?: JobPositionNature;
    createdAt?: string;
    updatedAt?: string;
}

export class JobPositionCreateDto {
    title!: string;
    sharedAcrossBranches?: boolean;
    cboCode?: string;
    departmentId?: string;
    nature?: JobPositionNature;
}
