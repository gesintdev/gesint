export type ExperiencePeriod = "NONE" | "DAYS_30_60" | "DAYS_45_45" | "DAYS_90";

export type ExperiencePeriodStatus =
    | "IN_PERIOD"
    | "PENDING_DECISION"
    | "EFFECTIVE"
    | "EXTENDED"
    | "ENDED";

export type ExperienceEvaluationStatus = "DRAFT" | "SUBMITTED";

export type ExperienceDecision = "EFFECTIVE" | "EXTEND" | "END" | "AUTO_EFFECTIVE";

export type ExperienceCompetency = {
    competencyId: string;
    competencyName?: string | null;
    expectedLevel?: string | null;
    source?: string | null;
};

export type ExperienceScoreView = {
    competencyId: string;
    competencyName?: string | null;
    score?: number | null;
    justification?: string | null;
};

export type ExperienceScoreItem = {
    competencyId: string;
    score: number;
    justification: string;
};

export type ExperienceEvaluation = {
    id: string;
    code?: number;
    status?: string;
    companyId?: string | null;
    collaboratorId: string;
    admissionProcessId: string;
    jobPositionId?: string | null;
    collaboratorName?: string | null;
    jobPositionName?: string | null;
    admissionDate?: string | null;
    experiencePeriod: ExperiencePeriod;
    experienceExtensionUsed: boolean;
    experienceMilestoneDays: number;
    experienceDueDate: string;
    periodStatus: ExperiencePeriodStatus;
    evaluationStatus: ExperienceEvaluationStatus;
    evaluatorUserId?: string | null;
    evaluatorName?: string | null;
    submittedAt?: string | null;
    averageScore?: number | null;
    selectionAverage?: number | null;
    decision?: ExperienceDecision | null;
    decisionReason?: string | null;
    decisionNotes?: string | null;
    decidedBy?: string | null;
    decidedByName?: string | null;
    decidedAt?: string | null;
    offboardingId?: string | null;
    canExtend: boolean;
    decided: boolean;
    createdAt?: string | null;
    updatedAt?: string | null;
    competencies?: ExperienceCompetency[];
    scores?: ExperienceScoreView[];
};

export type ExperienceSummary = {
    inPeriodCount: number;
    pendingDecisionCount: number;
    dueSoonCount: number;
    decidedCount: number;
};

export type ExperienceDecideRequest = {
    action: Exclude<ExperienceDecision, "AUTO_EFFECTIVE">;
    reason?: string;
    notes?: string;
};

export type ExperienceScoresUpsertRequest = {
    scores: ExperienceScoreItem[];
};

export type ExperienceEvaluationCreateDto = {
    admissionProcessId: string;
    collaboratorId?: string;
    experiencePeriod?: ExperiencePeriod;
};
