import type { LeaveRequest, LeaveRequestCreateDto } from "@/modules/person/leave/dto/leave-request.dto";

export function leaverequestToFormDto(entity: LeaveRequest): LeaveRequestCreateDto & { notes?: string } {
    return {
        collaboratorId: entity.collaboratorId ?? "",
        leaveType: entity.leaveType,
        startDate: entity.startDate?.slice(0, 10) ?? "",
        endDate: entity.endDate?.slice(0, 10) ?? "",
        approved: entity.approved ?? false,
        notes: entity.notes,
    };
}

export const emptyLeaveRequestForm = (): LeaveRequestCreateDto => ({
    collaboratorId: "",
    startDate: "",
    endDate: "",
    approved: false,
});
