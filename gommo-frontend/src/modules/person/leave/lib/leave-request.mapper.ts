import type { LeaveRequest, LeaveRequestCreateDto } from "@/modules/person/leave/dto/leave-request.dto";

export function leaverequestToFormDto(entity: LeaveRequest): LeaveRequestCreateDto {
    return {
        collaboratorId: entity.collaboratorId ?? "",
        leaveType: entity.leaveType,
        startDate: entity.startDate?.slice(0, 10) ?? "",
        endDate: entity.endDate?.slice(0, 10) ?? "",
        approved: entity.approved ?? false,
    };
}

export const emptyLeaveRequestForm = (): LeaveRequestCreateDto => ({
    collaboratorId: "",
    startDate: "",
    endDate: "",
    approved: false,
});
