export type InterviewEvaluationStatus = "DRAFT" | "SUBMITTED";

export type InterviewRecommendation = "ADVANCE" | "HOLD" | "REJECT";

export const INTERVIEW_RECOMMENDATION_ITEMS: Array<{ value: InterviewRecommendation; label: string }> = [
    { value: "ADVANCE", label: "Seguir no processo" },
    { value: "HOLD", label: "Manter em observação" },
    { value: "REJECT", label: "Não recomendar" },
];

export type InterviewCompetency = {
    competencyId: string;
    competencyName?: string | null;
    competencyType?: string | null;
    description?: string | null;
    interviewGuideQuestion?: string | null;
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
    recommendation?: InterviewRecommendation | null;
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
    recommendation?: InterviewRecommendation | null;
    scores: InterviewScoreItem[];
};
