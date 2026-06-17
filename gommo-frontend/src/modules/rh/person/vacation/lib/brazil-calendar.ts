const NATIONAL_HOLIDAYS = new Set([
    "2025-01-01",
    "2025-04-18",
    "2025-04-21",
    "2025-05-01",
    "2025-06-19",
    "2025-09-07",
    "2025-10-12",
    "2025-11-02",
    "2025-11-15",
    "2025-11-20",
    "2025-12-25",
    "2026-01-01",
    "2026-04-03",
    "2026-04-21",
    "2026-05-01",
    "2026-06-19",
    "2026-09-07",
    "2026-10-12",
    "2026-11-02",
    "2026-11-15",
    "2026-11-20",
    "2026-12-25",
    "2027-01-01",
    "2027-03-26",
    "2027-04-21",
    "2027-05-01",
    "2027-06-19",
    "2027-09-07",
    "2027-10-12",
    "2027-11-02",
    "2027-11-15",
    "2027-11-20",
    "2027-12-25",
]);

function toKey(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export function isNationalHoliday(date: Date): boolean {
    return NATIONAL_HOLIDAYS.has(toKey(date));
}

export function isWeeklyRestDay(date: Date): boolean {
    return date.getDay() === 0;
}
