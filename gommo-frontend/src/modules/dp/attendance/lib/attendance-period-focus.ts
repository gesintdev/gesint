export type AttendanceListPeriod = {
    from: string;
    to: string;
};

export const ATTENDANCE_LIST_PERIOD_KEY = "gommo-attendance-list-period";

export function writeAttendanceListPeriod(period: AttendanceListPeriod) {
    if (!period.from || !period.to) return;
    window.sessionStorage.setItem(ATTENDANCE_LIST_PERIOD_KEY, JSON.stringify(period));
}

export function peekAttendanceListPeriod(): AttendanceListPeriod | null {
    try {
        const raw = window.sessionStorage.getItem(ATTENDANCE_LIST_PERIOD_KEY);
        if (!raw) return null;
        const parsed = JSON.parse(raw) as AttendanceListPeriod;
        if (!parsed?.from || !parsed?.to) return null;
        return parsed;
    } catch {
        return null;
    }
}
