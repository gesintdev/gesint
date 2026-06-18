export class LeaveRequest {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    collaboratorId!: string;
    collaboratorName?: string;
    leaveType?: "VACATION" | "MEDICAL" | "MATERNITY" | "PATERNITY" | "UNPAID" | "OTHER";
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
    createdAt?: string;
    updatedAt?: string;
}

export class LeaveRequestCreateDto {
    collaboratorId!: string;
    leaveType?: "VACATION" | "MEDICAL" | "MATERNITY" | "PATERNITY" | "UNPAID" | "OTHER";
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
}

export class VacationEligibleCollaborator {
    collaboratorId!: string;
    collaboratorName!: string;
    cpf!: string;
    photoObjectId?: string;
    hireDate!: string;
    contractType!: "CLT";
    periodStatus!: "CONCESSIVE" | "EXPIRED";
    entitledDays!: number;
    unjustifiedAbsences!: number;
    justifiedAbsences!: number;
    acquisitionStart!: string;
    acquisitionEnd!: string;
    concessiveStart!: string;
    concessiveEnd!: string;
}
