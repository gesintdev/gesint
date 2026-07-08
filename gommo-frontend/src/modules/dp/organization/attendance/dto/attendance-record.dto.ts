export type AttendanceOccurrenceType =
    | "NORMAL_WORK"
    | "TIME_ADJUSTMENT"
    | "MEDICAL_CERTIFICATE"
    | "LEAVE_ABSENCE"
    | "UNJUSTIFIED_ABSENCE"
    | "LATE_ARRIVAL"
    | "VACATION"
    | "LICENSE";

export type AttendanceOccurrenceOrigin = "MANUAL" | "LEAVE_REQUEST" | "MOBILE";

export type AttendanceRequestType =
    | "TIME_ADJUSTMENT"
    | "DAY_ABSENCE_EXCUSE"
    | "MEDICAL_CERTIFICATE"
    | "LEAVE_ABSENCE"
    | "HOUR_BANK"
    | "OTHER";

export type AttendanceRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export class AttendanceRecord {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    collaboratorId!: string;
    workDate!: string;
    clockIn?: string;
    clockOut?: string;
    breakStart?: string;
    breakEnd?: string;
    breakMinutes?: number;
    occurrenceType?: AttendanceOccurrenceType;
    occurrenceOrigin?: AttendanceOccurrenceOrigin;
    referenceId?: string;
    expectedHours?: number;
    workedHours?: number;
    impactsHourBank?: boolean;
    impactsPayroll?: boolean;
    notes?: string;
    requestType?: AttendanceRequestType;
    source?: "MOBILE" | "BACKOFFICE";
    clientRequestId?: string;
    submittedAt?: string;
    requestStatus?: AttendanceRequestStatus;
    reviewedAt?: string;
    reviewedBy?: string;
    reviewReason?: string;
    photoObjectId?: string;
    latitude?: number;
    longitude?: number;
    locationAccuracyMeters?: number;
    createdAt?: string;
    updatedAt?: string;
}

export class AttendanceRecordCreateDto {
    collaboratorId!: string;
    workDate!: string;
    clockIn?: string;
    clockOut?: string;
    breakStart?: string;
    breakEnd?: string;
    breakMinutes?: number;
    occurrenceType?: AttendanceOccurrenceType;
    occurrenceOrigin?: AttendanceOccurrenceOrigin;
    referenceId?: string;
    expectedHours?: number;
    workedHours?: number;
    impactsHourBank?: boolean;
    impactsPayroll?: boolean;
    notes?: string;
    requestType?: AttendanceRequestType;
    source?: "MOBILE" | "BACKOFFICE";
    requestStatus?: AttendanceRequestStatus;
}

export type AttendanceReviewAction = "APPROVE" | "REJECT";

export type AttendanceSettings = {
    requirePhoto: boolean;
    requireLocation: boolean;
};
