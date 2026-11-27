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
    | "OUTSIDE_SCHEDULE"
    | "OTHER";

export type AttendanceRequestStatus = "PENDING" | "APPROVED" | "REJECTED";

export type AttendanceCompensationType = "HOUR_BANK" | "OVERTIME";

export class AttendanceRecord {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    collaboratorId!: string;
    collaboratorName?: string;
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
    photoObjectId?: string;
    latitude?: number;
    longitude?: number;
    locationAccuracyMeters?: number;
    pendingOutsideScheduleApproval?: boolean;
    createdAt?: string;
    updatedAt?: string;
}

export class AttendancePresenceRow {
    id!: string;
    hasRecord!: boolean;
    code?: number;
    status?: "ACTIVE" | "INACTIVE" | "DELETED";
    collaboratorId!: string;
    collaboratorName?: string;
    photoObjectId?: string;
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
    /** Soma dos débitos diários no período. */
    debitHours?: number;
    /** Soma dos créditos / hora extra no período. */
    creditHours?: number;
    impactsHourBank?: boolean;
    impactsPayroll?: boolean;
    notes?: string;
    inVacation!: boolean;
    onLeaveActive!: boolean;
    pendingAdjustmentRequest?: boolean;
    workScheduleId?: string;
    workScheduleName?: string;
    jobTitle?: string;
    /** Minutos trabalhados no período (apuração do Gestão de Ponto). */
    workedMinutes?: number;
    /** Horas extras pagas em folha no período. */
    overtimeMinutes?: number;
    /** Saldo do banco de horas gerado no período. */
    hourBankPeriodMinutes?: number;
    /** Saldo acumulado do banco de horas até o fim do período. */
    hourBankBalanceMinutes?: number;
    /** Dias com pendência (incompleto, sem registro ou ajuste aguardando decisão). */
    pendingCount?: number;
    incompleteDays?: number;
    missingDays?: number;
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
}

export class AttendanceRequest {
    id!: string;
    code!: number;
    status!: "ACTIVE" | "INACTIVE" | "DELETED";
    collaboratorId!: string;
    collaboratorName?: string;
    workDate!: string;
    attendanceRecordId?: string;
    originalClockIn?: string;
    originalClockOut?: string;
    originalBreakStart?: string;
    originalBreakEnd?: string;
    originalBreakMinutes?: number;
    originalNotes?: string;
    clockIn?: string;
    clockOut?: string;
    breakStart?: string;
    breakEnd?: string;
    breakMinutes?: number;
    expectedHours?: number;
    workedHours?: number;
    notes?: string;
    requestType!: AttendanceRequestType;
    source?: "MOBILE" | "BACKOFFICE";
    clientRequestId?: string;
    submittedAt?: string;
    requestStatus!: AttendanceRequestStatus;
    reviewedAt?: string;
    reviewedBy?: string;
    reviewReason?: string;
    compensationType?: AttendanceCompensationType;
    createdAt?: string;
    updatedAt?: string;
}

export type AttendanceReviewAction = "APPROVE" | "REJECT";

export type AttendanceSettings = {
    requirePhoto: boolean;
    requireLocation: boolean;
    /** Variação diária tolerada em minutos (CLT art. 58 §1º). */
    toleranceMinutes: number;
    hourBankEnabled: boolean;
    overtimeEnabled: boolean;
    /** Início da apuração do banco de horas (yyyy-MM-dd). */
    hourBankStartDate: string | null;
    notifyCollaborator: boolean;
    notifyHr: boolean;
    notifyNearLimits: boolean;
    emailCollaborator: boolean;
    emailHrDigest: boolean;
    hrDigestRecipients: string;
};

export type AttendanceScheduleDay = {
    collaboratorId: string;
    outsideWorkSchedule: boolean;
    workScheduleId?: string;
    workScheduleName?: string;
    /** Jornada esperada do dia (escala da admissão; 0 em folga). */
    expectedHours?: number;
};

export type AttendanceScheduleWeekDay =
    | "MONDAY"
    | "TUESDAY"
    | "WEDNESDAY"
    | "THURSDAY"
    | "FRIDAY"
    | "SATURDAY"
    | "SUNDAY";

export type AttendanceCollaboratorScheduleDay = {
    dayOfWeek: AttendanceScheduleWeekDay;
    expectedHours: number;
};

export type AttendanceCollaboratorSchedule = {
    collaboratorId: string;
    workScheduleId?: string;
    workScheduleName?: string;
    workloadSchedule?: string;
    fallbackDailyHours?: number;
    days: AttendanceCollaboratorScheduleDay[];
};

export type AttendanceMobileContext = {
    collaboratorId?: string;
    collaboratorName?: string;
    contractType?: string;
    workloadSchedule?: string;
    dailyWorkloadHours?: number;
    requirePhoto: boolean;
    requireLocation: boolean;
    todayRecord?: AttendanceRecord | null;
};

export type AttendanceClockPhoto = {
    objectId: string;
    fileName?: string;
    documentType?: string;
};

export type AttendanceClockPayload = {
    capturedAt: string;
    photo?: AttendanceClockPhoto;
    latitude?: number;
    longitude?: number;
    locationAccuracyMeters?: number;
    clientRequestId: string;
};

export type AttendanceSubmissionSource = "MOBILE" | "BACKOFFICE";

export type AttendancePunchSlotKey = "clockIn" | "breakStart" | "breakEnd" | "clockOut";

export type AttendanceSubmissionAttachment = {
    objectId: string;
    fileName?: string;
    documentType?: string;
};

export type AttendanceSubmissionPayload = {
    requestType: AttendanceRequestType;
    requestDate: string;
    targetRecordId?: string;
    manualPunchTime?: string;
    clockIn?: string;
    breakStart?: string;
    breakEnd?: string;
    clockOut?: string;
    details: string;
    attachment?: AttendanceSubmissionAttachment;
    source?: AttendanceSubmissionSource;
    clientRequestId: string;
    submittedAt: string;
};
