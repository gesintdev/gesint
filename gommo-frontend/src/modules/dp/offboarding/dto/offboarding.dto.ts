export type DismissalType =
    | "WITHOUT_CAUSE"
    | "WITH_CAUSE"
    | "RESIGNATION"
    | "AGREEMENT"
    | "END_OF_CONTRACT"
    | "OTHER";

export type OffboardingProcessStatus = "DRAFT" | "COMPLETED";

export type NoticeType =
    | "WORKED_BY_EMPLOYEE"
    | "WORKED_BY_EMPLOYER"
    | "INDEMNIFIED"
    | "NOT_APPLICABLE";

export type AccountantPackageStatus = "PENDING" | "READY" | "SENT" | "FAILED";

export type OffboardingChecklistItemStatus =
    | "PENDING"
    | "RETURNED"
    | "NOT_APPLICABLE"
    | "DAMAGED"
    | "LOST";

export class OffboardingChecklistItemDto {
    key!: string;
    description!: string;
    category?: "RETURN" | "ACCESS" | string;
    status!: OffboardingChecklistItemStatus | string;
    returnedAt?: string;
    notes?: string;
}

export class EsocialDismissalReasonDto {
    reasonCode!: string;
    description!: string;
    dismissalType!: string;
    label!: string;
}

export class OffboardingDemissionalPreviewDto {
    waived!: boolean;
    required!: boolean;
    message!: string;
    lastClinicalExamDate?: string | null;
    daysSinceLastExam?: number | null;
    riskGrade?: number | null;
    waiverWindowDays?: number | null;
    dueDate?: string | null;
    waiverRegistered!: boolean;
    waiverNotes?: string | null;
}

export class OffboardingAccountantPackageDto {
    offboardingId!: string;
    offboardingCode?: number;
    collaboratorId!: string;
    collaboratorName?: string;
    collaboratorCpf?: string;
    esocialDismissalReasonCode?: string;
    esocialDismissalReasonLabel?: string;
    dismissalDate?: string;
    lastWorkDay?: string;
    noticeType?: string;
    noticeDays?: number;
    noticeStartDate?: string;
    noticeEndDate?: string;
    accountantEmail?: string;
    accountantName?: string;
    packageStatus?: AccountantPackageStatus | string;
    packageSentAt?: string;
    packageDetail?: string;
    checklist!: OffboardingChecklistItemDto[];
    summaryText?: string;
}

export class Offboarding {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    collaboratorId!: string;
    collaboratorName?: string;
    dismissalDate!: string;
    dismissalType?: DismissalType;
    dismissalNotes?: string;
    homologationNotes?: string;
    processStatus!: OffboardingProcessStatus;
    esocialDismissalReasonCode?: string;
    esocialDismissalReasonLabel?: string;
    lastWorkDay?: string;
    noticeType?: NoticeType;
    noticeDays?: number;
    noticeStartDate?: string;
    noticeEndDate?: string;
    workloadReductionApplicable!: boolean;
    exitChecklist!: OffboardingChecklistItemDto[];
    exitInterviewId?: string;
    accountantPackageStatus?: AccountantPackageStatus;
    accountantPackageSentAt?: string;
    accountantPackageDetail?: string;
    demissionalWaiverRegistered!: boolean;
    demissionalWaiverNotes?: string;
    completedAt?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class OffboardingCreateDto {
    collaboratorId!: string;
    dismissalDate!: string;
    dismissalType?: DismissalType;
    dismissalNotes?: string;
    homologationNotes?: string;
    esocialDismissalReasonCode?: string;
    lastWorkDay?: string;
    noticeType?: NoticeType;
    noticeDays?: number;
    noticeStartDate?: string;
    noticeEndDate?: string;
    workloadReductionApplicable?: boolean;
    exitChecklist!: OffboardingChecklistItemDto[];
    exitInterviewId?: string;
    demissionalWaiverRegistered?: boolean;
    demissionalWaiverNotes?: string;
}
