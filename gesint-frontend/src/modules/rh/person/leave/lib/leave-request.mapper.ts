import type { LeaveRequest, LeaveRequestCreateDto } from "@/modules/rh/person/leave/dto/leave-request.dto";

export function leaverequestToFormDto(entity: LeaveRequest): LeaveRequestCreateDto & { notes?: string } {
    return {
        collaboratorId: entity.collaboratorId ?? "",
        leaveType: entity.leaveType,
        startDate: entity.startDate?.slice(0, 10) ?? "",
        endDate: entity.endDate?.slice(0, 10) ?? "",
        absenceStatus: entity.absenceStatus ?? "PENDING",
        durationDays: entity.durationDays,
        cid: entity.cid,
        physicianName: entity.physicianName,
        physicianCrm: entity.physicianCrm,
        certificateSource: entity.certificateSource,
        requiresInss: entity.requiresInss ?? false,
        inssReferralDate: entity.inssReferralDate?.slice(0, 10) ?? "",
        returnDate: entity.returnDate?.slice(0, 10) ?? "",
        workAccidentStability: entity.workAccidentStability ?? false,
        relatedCertificateDays: entity.relatedCertificateDays,
        approved: entity.approved ?? false,
        notes: entity.notes,
    };
}

export const emptyLeaveRequestForm = (): LeaveRequestCreateDto => ({
    collaboratorId: "",
    startDate: "",
    endDate: "",
    absenceStatus: "PENDING",
    requiresInss: false,
    workAccidentStability: false,
    approved: false,
});
