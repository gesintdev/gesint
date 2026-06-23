import type { LeaveRequest } from "@/modules/rh/person/leave/dto/leave-request.dto";

export type RhVacationStatus = "PENDING" | "APPROVED" | "IN_VACATION" | "RETURNED" | "REJECTED";

export type RhVacationRow = LeaveRequest & {
    rhVacationStatus: RhVacationStatus;
};

export function mapRhVacationStatus(row: LeaveRequest): RhVacationStatus {
    if (row.approved === true || row.reviewStatus === "APPROVED") {
        const today = new Date().toISOString().slice(0, 10);
        if (row.startDate <= today && today <= row.endDate) return "IN_VACATION";
        return "APPROVED";
    }
    if (row.reviewStatus === "RETURNED") return "RETURNED";
    if (row.reviewStatus === "REJECTED") return "REJECTED";
    return "PENDING";
}

export function toRhVacationRow(row: LeaveRequest): RhVacationRow {
    return {
        ...row,
        rhVacationStatus: mapRhVacationStatus(row),
    };
}

export function isApprovedLeave(row: LeaveRequest): boolean {
    return row.approved === true;
}

export function isPendingVacationRequest(row: LeaveRequest): boolean {
    return (
        row.leaveType === "VACATION" &&
        row.approved !== true &&
        row.reviewStatus !== "REJECTED" &&
        row.reviewStatus !== "RETURNED"
    );
}

export function isVacationHistory(row: LeaveRequest): boolean {
    return row.leaveType === "VACATION" && row.approved === true;
}

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
