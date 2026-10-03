export type InterviewEvaluationStatus = "DRAFT" | "SUBMITTED";

export type InterviewCompetency = {
    competencyId: string;
    competencyName?: string | null;
    competencyType?: string | null;
    source?: string | null;
};

export type InterviewScoreItem = {
    competencyId: string;
    score: number;
    justification?: string | null;
};

export type InterviewScoreView = {
    competencyId: string;
    competencyName?: string | null;
    score?: number | null;
    justification?: string | null;
};

export type InterviewEvaluationView = {
    id?: string;
    evaluatorUserId?: string;
    evaluatorName?: string | null;
    evaluationStatus?: InterviewEvaluationStatus;
    submittedAt?: string | null;
    mine?: boolean;
    scoresVisible?: boolean;
    scores?: InterviewScoreView[];
};

export type InterviewCompetencyAverage = {
    competencyId: string;
    competencyName?: string | null;
    average?: number | null;
    submissionsCount?: number | null;
};

export type InterviewScorecard = {
    applicationId: string;
    columnKey: string;
    interviewColumn: boolean;
    canSeeOthers: boolean;
    submittedCount: number;
    competencies: InterviewCompetency[];
    myEvaluation?: InterviewEvaluationView | null;
    otherEvaluations?: InterviewEvaluationView[];
    averages?: InterviewCompetencyAverage[];
};

export type InterviewScorecardUpsertDto = {
    columnKey: string;
    scores: InterviewScoreItem[];
};
