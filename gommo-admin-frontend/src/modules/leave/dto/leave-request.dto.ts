export class LeaveRequest {
    id!: string;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    collaboratorId!: string;
    leaveType?: "VACATION" | "MEDICAL" | "MATERNITY" | "PATERNITY" | "UNPAID" | "OTHER";
    startDate!: string;
    endDate!: string;
    approved?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export class LeaveRequestCreateDto {
    collaboratorId!: string;
    leaveType?: "VACATION" | "MEDICAL" | "MATERNITY" | "PATERNITY" | "UNPAID" | "OTHER";
    startDate!: string;
    endDate!: string;
    approved?: boolean;
}
