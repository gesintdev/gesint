export type DevelopmentPlanStatus = "DRAFT" | "PENDING_APPROVAL" | "IN_PROGRESS" | "IN_REVIEW" | "COMPLETED" | "CANCELED" | "OVERDUE";
export type DevelopmentActionStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED" | "OVERDUE" | "CANCELED";
export type CheckinFrequency = "WEEKLY" | "BIWEEKLY" | "MONTHLY" | "CUSTOM";
export type GoalType = "DEVELOP_COMPETENCY" | "IMPROVE_PERFORMANCE" | "PREPARE_PROMOTION" | "CORRECT_BEHAVIOR" | "LEARN_TOOL" | "DEVELOP_LEADERSHIP";
export type GapPriority = "NONE" | "MEDIUM" | "HIGH" | "CRITICAL";
export type DevelopmentActionType = "COURSE" | "MENTORING" | "READING" | "INTERNAL_TRAINING" | "JOB_ROTATION" | "PRACTICAL_PROJECT" | "MANAGER_FOLLOWUP" | "STRUCTURED_FEEDBACK" | "CERTIFICATION";

export class DevelopmentPlanCompetencyItem {
    id?: string;
    competencyId!: string;
    competencyName?: string;
    currentLevelId?: string;
    currentLevelOrder?: number;
    expectedLevelId?: string;
    expectedLevelOrder?: number;
    gap?: number;
    priority?: GapPriority;
    notes?: string;
}

export class DevelopmentPlanActionItem {
    id?: string;
    title!: string;
    description?: string;
    actionType?: DevelopmentActionType;
    assignee?: string;
    startDate?: string;
    endDate?: string;
    workloadHours?: number;
    estimatedCost?: number;
    evidenceRequired?: boolean;
    status?: DevelopmentActionStatus;
    progress?: number;
    notes?: string;
}

export class DevelopmentPlanGoalItem {
    id?: string;
    title!: string;
    description?: string;
    competencyId?: string;
    competencyName?: string;
    type?: GoalType;
    expectedResult?: string;
    successIndicator?: string;
    deadline?: string;
    weight?: number;
    status?: DevelopmentActionStatus;
    progress?: number;
    actions: DevelopmentPlanActionItem[] = [];
}

export class DevelopmentPlanCheckinItem {
    id?: string;
    date!: string;
    participants?: string;
    summary?: string;
    perceivedProgress?: number;
    blockers?: string;
    nextSteps?: string;
    collaboratorRating?: number;
    managerRating?: number;
}

export class DevelopmentPlanEvidenceItem {
    id?: string;
    evidenceTypeId?: string;
    evidenceTypeName?: string;
    description?: string;
    file?: string;
    link?: string;
    goalId?: string;
    actionId?: string;
    date?: string;
    responsibleUserId?: string;
    responsibleUserName?: string;
}

export class DevelopmentPlan {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    collaboratorId!: string;
    collaboratorName?: string;
    registrationNumber?: string;
    jobPositionId?: string;
    jobPositionName?: string;
    targetJobPositionId?: string;
    targetJobPositionName?: string;
    departmentId?: string;
    departmentName?: string;
    managerId?: string;
    managerName?: string;
    trackId?: string;
    trackName?: string;
    originId?: string;
    originName?: string;
    startDate?: string;
    endDate?: string;
    checkinFrequency?: CheckinFrequency;
    checkinFrequencyDays?: number;
    planStatus!: DevelopmentPlanStatus;
    notes?: string;
    progress?: number;
    lastCheckinAt?: string;
    overdue?: boolean;
    missingRecentCheckin?: boolean;
    cancelReason?: string;
    competencies: DevelopmentPlanCompetencyItem[] = [];
    goals: DevelopmentPlanGoalItem[] = [];
    checkins: DevelopmentPlanCheckinItem[] = [];
    evidences: DevelopmentPlanEvidenceItem[] = [];
    createdAt?: string;
    updatedAt?: string;
}

export class DevelopmentPlanCreateDto {
    collaboratorId!: string;
    jobPositionId?: string;
    jobPositionName?: string;
    departmentId?: string;
    departmentName?: string;
    targetJobPositionId?: string;
    targetJobPositionName?: string;


    managerId?: string;
    managerName?: string;
    trackId?: string;
    trackName?: string;
    originId?: string;
    originName?: string;
    startDate?: string;
    endDate?: string;
    checkinFrequency?: CheckinFrequency;
    checkinFrequencyDays?: number;
    planStatus?: DevelopmentPlanStatus;
    notes?: string;
    competencies: DevelopmentPlanCompetencyItem[] = [];
    goals: DevelopmentPlanGoalItem[] = [];
    checkins: DevelopmentPlanCheckinItem[] = [];
    evidences: DevelopmentPlanEvidenceItem[] = [];
}
export class DevelopmentPlanFormDto extends DevelopmentPlanCreateDto {
    collaboratorName?: string;
    registrationNumber?: string;
}