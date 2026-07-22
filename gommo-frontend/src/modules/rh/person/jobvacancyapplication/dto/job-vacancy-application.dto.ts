export type JobVacancyApplicationStatus =
    | "APPLIED"
    | "SCREENING"
    | "INTERVIEW"
    | "OFFER"
    | "HIRED"
    | "REJECTED";

export type JobVacancyApplicationStageComment = {
    text?: string;
    updatedAt?: string;
    updatedBy?: string;
};

export class JobVacancyApplication {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    jobVacancyId!: string;
    jobVacancyTitle?: string;
    candidateId!: string;
    candidateFullName?: string;
    candidateCpf?: string;
    candidateEmail?: string;
    candidatePhone?: string;
    applicationStatus!: JobVacancyApplicationStatus;
    kanbanColumnKey?: string | null;
    stageComments?: Record<string, JobVacancyApplicationStageComment> | null;
    appliedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class JobVacancyApplicationCreateDto {
    jobVacancyId!: string;
    candidateId!: string;
    applicationStatus?: JobVacancyApplicationStatus;
    kanbanColumnKey?: string | null;
    appliedAt?: string;
}
