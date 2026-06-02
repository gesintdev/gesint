import type {LeaveRequest} from "@/modules/person/leave/dto/leave-request.dto";

export function isApprovedLeave(row: LeaveRequest): boolean {
    return row.approved === true;
}

export function isPendingVacationRequest(row: LeaveRequest): boolean {
    return row.leaveType === "VACATION" && row.approved !== true;
}

export function isVacationHistory(row: LeaveRequest): boolean {
    return row.leaveType === "VACATION" && row.approved === true;
}

/** Férias visíveis no RH: solicitações enviadas ao DP (pendentes) e já concedidas. */
export function isRhVacationListing(row: LeaveRequest): boolean {
    return row.leaveType === "VACATION";
}

export function isRegisteredLeave(row: LeaveRequest): boolean {
    return row.approved === true;
}

export function isApprovedVacation(row: LeaveRequest): boolean {
    return row.leaveType === "VACATION" && row.approved === true;
}

export function isAbsenceLeave(row: LeaveRequest): boolean {
    return row.leaveType !== "VACATION" && row.approved === true;
}
