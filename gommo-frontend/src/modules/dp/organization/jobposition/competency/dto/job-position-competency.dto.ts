export type JobPositionCompetencyExpectedLevel = "LEVEL_1" | "LEVEL_2" | "LEVEL_3" | "LEVEL_4";

export type JobPositionCompetencyUsage =
    | "SELECTION"
    | "EXPERIENCE"
    | "PERFORMANCE"
    | "INTERVIEW"
    | "TECHNICAL_TEST"
    | "PDI";

export type CompetencyType = "TECHNICAL" | "BEHAVIORAL" | "LEADERSHIP";

export class JobPositionCompetency {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    jobPositionId!: string;
    companyId?: string | null;
    competencyId!: string;
    competencyName?: string;
    competencyType?: CompetencyType;
    expectedLevel!: JobPositionCompetencyExpectedLevel;
    usedIn!: JobPositionCompetencyUsage[];
    versionNumber!: number;
    validFrom!: string;
    validUntil?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export class JobPositionCompetencyCreateDto {
    jobPositionId!: string;
    competencyId!: string;
    competencyName?: string;
    expectedLevel!: JobPositionCompetencyExpectedLevel;
    usedIn!: JobPositionCompetencyUsage[];
    validFrom!: string;
    validUntil?: string;
}
