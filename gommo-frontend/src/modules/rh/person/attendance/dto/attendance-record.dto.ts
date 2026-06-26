export class AttendanceRecord {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    collaboratorId!: string;
    workDate!: string;
    clockIn!: string;
    clockOut!: string;
    breakMinutes?: number;
    occurrenceType?: "NORMAL_WORK" | "MEDICAL_CERTIFICATE" | "LEAVE_ABSENCE" | "UNJUSTIFIED_ABSENCE" | "LATE_ARRIVAL" | "VACATION" | "LICENSE";
    occurrenceOrigin?: "MANUAL" | "LEAVE_REQUEST";
    referenceId?: string;
    expectedHours?: number;
    workedHours?: number;
    impactsHourBank?: boolean;
    impactsPayroll?: boolean;
    notes?: string;
    createdAt?: string;
    updatedAt?: string;
}

export class AttendanceRecordCreateDto {
    collaboratorId!: string;
    workDate!: string;
    clockIn?: string;
    clockOut?: string;
    breakMinutes?: number;
    occurrenceType?: "NORMAL_WORK" | "MEDICAL_CERTIFICATE" | "LEAVE_ABSENCE" | "UNJUSTIFIED_ABSENCE" | "LATE_ARRIVAL" | "VACATION" | "LICENSE";
    occurrenceOrigin?: "MANUAL" | "LEAVE_REQUEST";
    referenceId?: string;
    expectedHours?: number;
    workedHours?: number;
    impactsHourBank?: boolean;
    impactsPayroll?: boolean;
    notes?: string;
}
