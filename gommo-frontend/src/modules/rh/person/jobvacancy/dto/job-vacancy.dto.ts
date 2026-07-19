export type JobVacancySeniority = "JUNIOR" | "PLENO" | "SENIOR";

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
    seniorityLevel?: JobVacancySeniority;
    expectedCompletionDate?: string;
    targetBoards?: JobBoardKey[];
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
    seniorityLevel?: JobVacancySeniority;
    expectedCompletionDate?: string;
    targetBoards?: JobBoardKey[];
}
