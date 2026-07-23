export type JobVacancySeniority = "JUNIOR" | "PLENO" | "SENIOR";

export type JobVacancyWorkModality = "PRESENCIAL" | "HIBRIDO" | "REMOTO";

export type JobVacancyContractType = "CLT" | "PJ" | "ESTAGIO" | "TEMPORARIO" | "FREELANCER";

export type JobBoardKey = "CATHO" | "INDEED" | "LINKEDIN" | "INFOJOBS" | "VAGAS_COM";

export class JobVacancy {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    jobPositionId?: string | null;
    jobTitle!: string;
    positionsCount!: number;
    description?: string;
    activities?: string;
    assignments?: string;
    requirements?: string;
    benefits?: string;
    department?: string;
    location?: string;
    workModality?: JobVacancyWorkModality;
    contractType?: JobVacancyContractType;
    workSchedule?: string;
    seniorityLevel?: JobVacancySeniority;
    salary?: number;
    salaryMax?: number;
    expectedCompletionDate?: string;
    targetBoards?: JobBoardKey[];
    slug?: string | null;
    isPublic?: boolean;
    publishedAt?: string | null;
    candidateCount?: number;
    createdAt?: string;
    updatedAt?: string;
}

export class JobVacancyCreateDto {
    jobPositionId?: string | null;
    jobTitle!: string;
    positionsCount!: number;
    description?: string;
    activities?: string;
    assignments?: string;
    requirements?: string;
    benefits?: string;
    department?: string;
    location?: string;
    workModality?: JobVacancyWorkModality;
    contractType?: JobVacancyContractType;
    workSchedule?: string;
    seniorityLevel?: JobVacancySeniority;
    salary?: string | number;
    salaryMax?: string | number;
    expectedCompletionDate?: string;
    targetBoards?: JobBoardKey[];
    slug?: string;
    isPublic?: boolean;
}
