export type ExitInterviewStatus = "DRAFT" | "SCHEDULED" | "IN_PROGRESS" | "COMPLETED" | "CANCELED";

export type ExitInterviewRelationshipType = "CLT" | "PJ";

export type ExitInterviewRehireAnswer = "YES" | "NO" | "MAYBE";

export type ReturnItemStatus = "PENDING" | "RETURNED" | "NOT_APPLICABLE" | "DAMAGED" | "LOST";

export type ExitInterviewQuestionType =
    | "SHORT_TEXT"
    | "LONG_TEXT"
    | "NUMBER"
    | "RATING"
    | "MULTIPLE_CHOICE"
    | "CHECKBOX"
    | "YES_NO"
    | "DATE"
    | "SELECT"
    | "LIKERT_SCALE";

export type ExitInterviewTerminationType =
    | "CLT_RESIGNATION"
    | "CLT_DISMISSAL_WITHOUT_CAUSE"
    | "CLT_DISMISSAL_WITH_CAUSE"
    | "CLT_PROBATION_CONTRACT_END"
    | "CLT_FIXED_TERM_CONTRACT_END"
    | "CLT_MUTUAL_AGREEMENT"
    | "CLT_RETIREMENT"
    | "CLT_DEATH"
    | "CLT_OTHER"
    | "PJ_COMPANY_INITIATIVE"
    | "PJ_PROVIDER_INITIATIVE"
    | "PJ_CONTRACT_END"
    | "PJ_MUTUAL_AGREEMENT"
    | "PJ_CONTRACT_BREACH"
    | "PJ_PROVIDER_REPLACEMENT"
    | "PJ_OTHER";

export type ExitInterviewReason =
    | "COMPENSATION"
    | "BENEFITS"
    | "EXTERNAL_OFFER"
    | "LACK_OF_GROWTH"
    | "LEADERSHIP"
    | "ORGANIZATIONAL_CLIMATE"
    | "CULTURE"
    | "WORKLOAD"
    | "RELOCATION"
    | "PERSONAL_REASONS"
    | "HEALTH"
    | "PERFORMANCE"
    | "CONTRACT_END"
    | "PROCESS_DISSATISFACTION"
    | "OTHER";

export class ExitInterviewRatingDto {
    key!: string;
    label!: string;
    score?: number | null;
}

export class ExitInterviewAnswerDto {
    key!: string;
    question!: string;
    type!: ExitInterviewQuestionType;
    answer?: string;
}

export class ExitInterviewReturnChecklistItemDto {
    key!: string;
    description!: string;
    status!: ReturnItemStatus;
    returnedAt?: string;
    notes?: string;
}

export class ExitInterview {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    collaboratorId!: string;
    interviewDate!: string;
    departureReason?: string;
    feedback?: string;
    wouldRecommend?: boolean;
    interviewStatus!: ExitInterviewStatus;
    relationshipType!: ExitInterviewRelationshipType;
    collaboratorName?: string;
    registrationNumber?: string;
    jobPositionName?: string;
    jobPositionId?: string;
    departmentName?: string;
    departmentId?: string;
    companyName?: string;
    managerName?: string;
    admissionOrContractStartDate?: string;
    terminationOrContractEndDate?: string;
    tenureDays?: number;
    terminationType?: ExitInterviewTerminationType;
    interviewerName?: string;
    mainReason?: ExitInterviewReason;
    secondaryReasons!: ExitInterviewReason[];
    detailedReason?: string;
    ratings!: ExitInterviewRatingDto[];
    openAnswers!: ExitInterviewAnswerDto[];
    wouldReturn?: ExitInterviewRehireAnswer;
    companyWouldRehire?: ExitInterviewRehireAnswer;
    rehireNotes?: string;
    returnChecklist!: ExitInterviewReturnChecklistItemDto[];
    templateKey?: string;
    templateVersion?: number;
    templatePayload?: Record<string, unknown>;
    completedAt?: string;
    canceledAt?: string;
    cancelReason?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class ExitInterviewCreateDto {
    collaboratorId!: string;
    interviewDate!: string;
    departureReason?: string;
    feedback?: string;
    wouldRecommend?: boolean;
    interviewStatus!: ExitInterviewStatus;
    relationshipType!: ExitInterviewRelationshipType;
    collaboratorName?: string;
    registrationNumber?: string;
    jobPositionName?: string;
    jobPositionId?: string;
    departmentName?: string;
    departmentId?: string;
    companyName?: string;
    managerName?: string;
    admissionOrContractStartDate?: string;
    terminationOrContractEndDate?: string;
    tenureDays?: number;
    terminationType?: ExitInterviewTerminationType;
    interviewerName?: string;
    mainReason?: ExitInterviewReason;
    secondaryReasons!: ExitInterviewReason[];
    detailedReason?: string;
    ratings!: ExitInterviewRatingDto[];
    openAnswers!: ExitInterviewAnswerDto[];
    wouldReturn?: ExitInterviewRehireAnswer;
    companyWouldRehire?: ExitInterviewRehireAnswer;
    rehireNotes?: string;
    returnChecklist!: ExitInterviewReturnChecklistItemDto[];
    templateKey?: string;
    templateVersion?: number;
    templatePayload?: Record<string, unknown>;
}

export class ExitInterviewCancelDto {
    reason?: string;
}
