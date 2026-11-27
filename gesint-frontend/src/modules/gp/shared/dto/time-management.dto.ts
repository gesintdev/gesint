/** Contratos da API da Gestão de Ponto (/api/v1/time-management, /hour-bank, /timesheets). */

export type AttendanceDayStatus =
    | "OK"
    | "INCOMPLETE"
    | "MISSING"
    | "IN_PROGRESS"
    | "PENDING_START"
    | "DAY_OFF"
    | "HOLIDAY"
    | "VACATION"
    | "LEAVE"
    | "UNJUSTIFIED_ABSENCE"
    | "NOT_EMPLOYED";

export type AttendanceAlert =
    | "OVER_10_HOURS"
    | "OVERTIME_OVER_2_HOURS"
    | "NO_BREAK"
    | "SHORT_BREAK"
    | "OVER_6_HOURS_WITHOUT_BREAK"
    | "SHORT_INTERJOURNEY"
    | "LATE_ARRIVAL"
    | "EARLY_LEAVE"
    | "PENDING_REQUEST";

export type AttendanceDay = {
    date: string;
    status: AttendanceDayStatus;
    recordId?: string | null;
    clockIn?: string | null;
    breakStart?: string | null;
    breakEnd?: string | null;
    clockOut?: string | null;
    scheduledStart?: string | null;
    scheduledEnd?: string | null;
    occurrenceType?: string | null;
    occurrenceOrigin?: string | null;
    expectedMinutes: number;
    workedMinutes: number;
    breakMinutes: number;
    overtimeMinutes: number;
    hourBankMinutes: number;
    debitMinutes: number;
    lateMinutes: number;
    earlyLeaveMinutes: number;
    restBeforeMinutes?: number | null;
    pending: boolean;
    alerts: AttendanceAlert[];
};

export type TimeDashboard = {
    generatedAt: string;
    periodStart: string;
    periodEnd: string;
    rosterSize: number;
    hourBankEnabled: boolean;
    overtimeEnabled: boolean;
    now: {
        working: number;
        onBreak: number;
        late: number;
        inOvertime: number;
        earlyLeave: number;
        finished: number;
        away: number;
        expectedToday: number;
    };
    limits: {
        overtimeMinutes: number;
        workedMinutes: number;
        expectedMinutes: number;
        over10HoursDays: number;
        over10HoursCollaborators: number;
        overtimeOver2HoursDays: number;
        shortBreakDays: number;
        noBreakDays: number;
        over6HoursWithoutBreakDays: number;
        shortInterjourneyDays: number;
        lateArrivalDays: number;
        missingDays: number;
        incompleteDays: number;
        absenteeismPercent: number;
    };
    hourBank: {
        positiveMinutes: number;
        negativeMinutes: number;
        collaboratorsPositive: number;
        collaboratorsNegative: number;
    };
    pendingRequests: Array<{
        id: string;
        collaboratorId: string;
        collaboratorName?: string | null;
        requestType?: string | null;
        workDate?: string | null;
        notes?: string | null;
        submittedAt?: string | null;
    }>;
    pendingRequestsTotal: number;
    attention: Array<{
        collaboratorId: string;
        collaboratorName: string;
        jobTitle?: string | null;
        photoObjectId?: string | null;
        pendingDays: number;
        alerts: number;
        hourBankMinutes: number;
    }>;
    daily: Array<{
        date: string;
        workedMinutes: number;
        expectedMinutes: number;
        overtimeMinutes: number;
        absences: number;
        alerts: number;
    }>;
};

export type TimeStatusMetric =
    | "WORKING"
    | "ON_BREAK"
    | "LATE"
    | "IN_OVERTIME"
    | "EARLY_LEAVE_TODAY"
    | "AWAY"
    | "ABSENTEEISM"
    | "OVERTIME"
    | "OVER_10_HOURS"
    | "OVERTIME_OVER_2_HOURS"
    | "OVER_6_HOURS_WITHOUT_BREAK"
    | "NO_BREAK"
    | "SHORT_BREAK"
    | "SHORT_INTERJOURNEY"
    | "LATE_ARRIVAL"
    | "EARLY_LEAVE"
    | "MISSING_DAYS"
    | "INCOMPLETE_DAYS";

export type TimeStatusRow = {
    id: string;
    collaboratorId: string;
    collaboratorName: string;
    jobTitle?: string | null;
    departmentName?: string | null;
    date?: string | null;
    clockIn?: string | null;
    clockOut?: string | null;
    scheduledStart?: string | null;
    minutes: number;
    expectedMinutes: number;
    days: number;
    percent?: number | null;
};

export type TimeStatusReport = {
    metric: TimeStatusMetric;
    periodStart: string;
    periodEnd: string;
    totalMinutes: number;
    rows: TimeStatusRow[];
};

export type HourBankRow = {
    id: string;
    collaboratorId: string;
    collaboratorName: string;
    jobTitle?: string | null;
    photoObjectId?: string | null;
    workScheduleName?: string | null;
    previousBalanceMinutes: number;
    periodCreditMinutes: number;
    periodDebitMinutes: number;
    periodBalanceMinutes: number;
    totalBalanceMinutes: number;
};

export type HourBankBalances = {
    enabled: boolean;
    accrualStart: string;
    periodStart: string;
    periodEnd: string;
    rows: HourBankRow[];
};

export type HourBankStatement = {
    collaboratorId: string;
    collaboratorName: string;
    accrualStart: string;
    previousBalanceMinutes: number;
    totalBalanceMinutes: number;
    lines: Array<{
        date: string;
        status: AttendanceDayStatus;
        expectedMinutes: number;
        workedMinutes: number;
        hourBankMinutes: number;
        runningBalanceMinutes: number;
    }>;
};

export type TimesheetClosingStatus = "OPEN" | "CLOSED";

export type TimesheetRow = {
    id: string;
    collaboratorId: string;
    collaboratorName: string;
    jobTitle?: string | null;
    photoObjectId?: string | null;
    workScheduleName?: string | null;
    expectedMinutes: number;
    workedMinutes: number;
    overtimeMinutes: number;
    hourBankMinutes: number;
    pendingCount: number;
    closingStatus: TimesheetClosingStatus;
    closedAt?: string | null;
};

export type TimesheetList = {
    periodStart: string;
    periodEnd: string;
    hourBankEnabled: boolean;
    overtimeEnabled: boolean;
    rows: TimesheetRow[];
};

export type TimesheetDetail = {
    collaboratorId: string;
    collaboratorCode?: number | null;
    collaboratorName: string;
    jobTitle?: string | null;
    departmentName?: string | null;
    workScheduleName?: string | null;
    admissionDate?: string | null;
    periodStart: string;
    periodEnd: string;
    closingStatus: TimesheetClosingStatus;
    closedAt?: string | null;
    reopenReason?: string | null;
    hourBankEnabled: boolean;
    overtimeEnabled: boolean;
    expectedMinutes: number;
    workedMinutes: number;
    overtimeMinutes: number;
    hourBankMinutes: number;
    debitMinutes: number;
    previousBalanceMinutes: number;
    totalBalanceMinutes: number;
    pendingCount: number;
    days: AttendanceDay[];
};

export type TimesheetCloseResult = {
    closed: number;
    skippedWithPending: string[];
};

export type AbsenceCalendarEvent = {
    id: string;
    collaboratorId: string;
    collaboratorName?: string | null;
    type?: string | null;
    category: "VACATION" | "LEAVE" | "ABSENCE";
    startDate: string;
    endDate: string;
};

export type AbsenceCalendar = {
    periodStart: string;
    periodEnd: string;
    events: AbsenceCalendarEvent[];
    holidays: string[];
};
