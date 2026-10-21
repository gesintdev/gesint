export class JobVacancyCompetency {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    jobVacancyId!: string;
    companyId?: string | null;
    competencyId!: string;
    competencyName?: string | null;
    competencyType?: string | null;
    displayOrder!: number;
    createdAt?: string;
    updatedAt?: string;
}

export class JobVacancyCompetencyCreateDto {
    jobVacancyId!: string;
    competencyId!: string;
    displayOrder?: number;
}
