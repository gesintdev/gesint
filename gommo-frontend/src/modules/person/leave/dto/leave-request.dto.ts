export class LeaveRequest {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
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
}
