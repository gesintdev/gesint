import type { DismissalType } from "@/modules/dp/offboarding/dto/offboarding.dto";
import type { JobPositionSalaryLevel } from "@/modules/dp/organization/jobposition/salarytable/dto/job-position-salary-table.dto";
import type { JobVacancyContractType } from "@/modules/rh/person/jobvacancy/dto/job-vacancy.dto";

export type JobRequisitionReason = "HEADCOUNT_INCREASE" | "REPLACEMENT";

export type JobRequisitionExperiencePeriod = "NONE" | "DAYS_30_60" | "DAYS_45_45" | "DAYS_90";

export type JobRequisitionStatus =
    | "DRAFT"
    | "PENDING_MANAGER"
    | "PENDING_HR"
    | "PENDING_DIRECTOR"
    | "APPROVED"
    | "REJECTED"
    | "CANCELED";

export class JobRequisition {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    companyId?: string | null;
    jobPositionId!: string;
    jobPositionTitle?: string | null;
    salaryLevel?: JobPositionSalaryLevel | null;
    contractType?: JobVacancyContractType | null;
    experiencePeriod?: JobRequisitionExperiencePeriod | null;
    positionsCount!: number;
    desiredStartDate?: string | null;
    reason!: JobRequisitionReason;
    offboardingId?: string | null;
    replacedCollaboratorId?: string | null;
    replacedCollaboratorName?: string | null;
    replacedDismissalDate?: string | null;
    replacedDismissalType?: DismissalType | null;
    proposedSalary?: number | null;
    bandMinSalary?: number | null;
    bandReferenceSalary?: number | null;
    bandMaxSalary?: number | null;
    outOfBand!: boolean;
    justification?: string | null;
    requisitionStatus!: JobRequisitionStatus;
    submittedAt?: string | null;
    managerApprovedByName?: string | null;
    managerApprovedAt?: string | null;
    hrApprovedByName?: string | null;
    hrApprovedAt?: string | null;
    directorApprovedByName?: string | null;
    directorApprovedAt?: string | null;
    rejectedByName?: string | null;
    rejectedAt?: string | null;
    rejectedStage?: JobRequisitionStatus | null;
    rejectionReason?: string | null;
    canceledAt?: string | null;
    jobVacancyId?: string | null;
    createdAt?: string;
    updatedAt?: string;
}

export class JobRequisitionFormDto {
    jobPositionId!: string;
    salaryLevel?: JobPositionSalaryLevel;
    contractType?: JobVacancyContractType;
    experiencePeriod?: JobRequisitionExperiencePeriod;
    positionsCount!: number;
    desiredStartDate?: string;
    reason!: JobRequisitionReason;
    offboardingId?: string;
    /** Decimal "2750.00" (formato do InputCurrency com emitAsDecimal). */
    proposedSalary?: string;
    justification?: string;
}

export class JobRequisitionCreateDto {
    jobPositionId!: string;
    salaryLevel?: JobPositionSalaryLevel;
    contractType?: JobVacancyContractType;
    experiencePeriod?: JobRequisitionExperiencePeriod;
    positionsCount!: number;
    desiredStartDate?: string;
    reason!: JobRequisitionReason;
    offboardingId?: string;
    proposedSalary?: number;
    justification?: string;
}

export class JobRequisitionRejectDto {
    reason!: string;
}
