import type { LeaveType } from "@/modules/rh/person/leave/lib/leave-types";

export class LeaveRequest {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    collaboratorId!: string;
    collaboratorName?: string;
    leaveType?: LeaveType;
    startDate!: string;
    endDate!: string;
    approved?: boolean;
    notes?: string;
    pecuniaryAllowanceDays?: number;
    unjustifiedAbsences?: number;
    vacationDaysEntitled?: number;
    acquisitionPeriodStart?: string;
    acquisitionPeriodEnd?: string;
    splitGroupId?: string;
    splitSequence?: number;
    baseSalarySnapshot?: number;
    justifiedAbsences?: number;
    reviewStatus?: "PENDING" | "APPROVED" | "RETURNED" | "REJECTED";
    reviewReason?: string;
    recessPeriodId?: string;
    recessFinancialMode?: "FULLY_PAID" | "UNPAID" | "PROPORTIONAL" | "CUSTOM";
    recessPaidPercentage?: number;
    createdAt?: string;
    updatedAt?: string;
}

export class LeaveRequestCreateDto {
    collaboratorId!: string;
    leaveType?: LeaveType;
    startDate!: string;
    endDate!: string;
    approved?: boolean;
    notes?: string;
    pecuniaryAllowanceDays?: number;
    unjustifiedAbsences?: number;
    vacationDaysEntitled?: number;
    acquisitionPeriodStart?: string;
    acquisitionPeriodEnd?: string;
    splitGroupId?: string;
    splitSequence?: number;
    baseSalarySnapshot?: number;
    justifiedAbsences?: number;
    reviewStatus?: "PENDING" | "APPROVED" | "RETURNED" | "REJECTED";
    reviewReason?: string;
    recessPeriodId?: string;
}

export class VacationEligibleCollaborator {
    collaboratorId!: string;
    collaboratorName!: string;
    cpf!: string;
    photoObjectId?: string;
    hireDate!: string;
    contractType!: "CLT" | "PJ";
    periodStatus!: "CONCESSIVE" | "EXPIRED" | "CONTRACT_RECESS";
    entitledDays!: number;
    unjustifiedAbsences!: number;
    justifiedAbsences!: number;
    acquisitionStart!: string;
    acquisitionEnd!: string;
    concessiveStart!: string;
    concessiveEnd!: string;
    recessPeriodId?: string;
    recessFinancialMode?: "FULLY_PAID" | "UNPAID" | "PROPORTIONAL" | "CUSTOM";
    recessPaidPercentage?: number;
    recessAllowSplit?: boolean;
    recessMaxSplitPeriods?: number;
    recessMinimumSplitDays?: number;
    recessAdvanceNoticeDays?: number;
}
