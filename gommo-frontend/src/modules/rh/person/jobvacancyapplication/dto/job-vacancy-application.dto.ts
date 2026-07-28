export type JobVacancyApplicationStatus =
    | "APPLIED"
    | "SCREENING"
    | "INTERVIEW"
    | "OFFER"
    | "HIRED"
    | "REJECTED";

export type ApplicationAiStatus = "PENDING" | "PROCESSING" | "READY" | "FAILED" | "SKIPPED";

export type JobVacancyApplicationStageComment = {
    text?: string;
    updatedAt?: string;
    updatedBy?: string;
};

export type ApplicationAiCriterion = {
    id?: string;
    label?: string;
    required?: string;
    found?: string;
    score?: number;
    weight?: number;
};

export type ApplicationAiAnalysis = {
    summary?: string;
    hasCurriculum?: boolean;
    seniorityGuess?: string | null;
    skills?: string[];
    matchedSkills?: string[];
    missingSkills?: string[];
    criteria?: ApplicationAiCriterion[];
    rubricVersion?: string;
    provider?: string;
    model?: string;
    error?: string;
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
    salaryExpectation?: number | null;
    aiScore?: number | null;
    aiStatus?: ApplicationAiStatus | null;
    aiAnalyzedAt?: string | null;
    aiAnalysis?: ApplicationAiAnalysis | null;
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
