import type {
    WeekDay,
    WorkSchedule,
    WorkScheduleCreateDto,
    WorkScheduleDayCreateDto,
} from "@/modules/cfg/settings/workschedule/dto/work-schedule.dto";

export const WEEK_DAY_LABELS: Record<WeekDay, string> = {
    MONDAY: "Segunda-feira",
    TUESDAY: "Terça-feira",
    WEDNESDAY: "Quarta-feira",
    THURSDAY: "Quinta-feira",
    FRIDAY: "Sexta-feira",
    SATURDAY: "Sábado",
    SUNDAY: "Domingo",
};

/** Dias padrão do quadro (segunda a sexta). */
export const DEFAULT_SCHEDULE_DAYS: WeekDay[] = [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
];

export function emptyDay(dayOfWeek: WeekDay): WorkScheduleDayCreateDto {
    return {
        dayOfWeek,
        period1Start: "",
        period1End: "",
        period2Start: "",
        period2End: "",
    };
}

export function emptyWorkScheduleForm(): WorkScheduleCreateDto {
    return {
        name: "",
        description: "",
        days: DEFAULT_SCHEDULE_DAYS.map(emptyDay),
    };
}

export function workScheduleToFormDto(entity: WorkSchedule): WorkScheduleCreateDto {
    const byDay = new Map((entity.days ?? []).map((day) => [day.dayOfWeek, day]));
    return {
        name: entity.name ?? "",
        description: entity.description ?? "",
        days: DEFAULT_SCHEDULE_DAYS.map((dayOfWeek) => {
            const existing = byDay.get(dayOfWeek);
            return {
                dayOfWeek,
                period1Start: existing?.period1Start ?? "",
                period1End: existing?.period1End ?? "",
                period2Start: existing?.period2Start ?? "",
                period2End: existing?.period2End ?? "",
            };
        }),
    };
}

function minutesBetween(start?: string, end?: string): number {
    if (!start || !end || !start.includes(":") || !end.includes(":")) return 0;
    const [sh, sm] = start.split(":").map(Number);
    const [eh, em] = end.split(":").map(Number);
    if ([sh, sm, eh, em].some((n) => Number.isNaN(n))) return 0;
    const diff = eh * 60 + em - (sh * 60 + sm);
    return diff > 0 ? diff : 0;
}

export function formatMinutesAsTime(minutes: number): string {
    const safe = Math.max(0, minutes);
    return `${String(Math.floor(safe / 60)).padStart(2, "0")}:${String(safe % 60).padStart(2, "0")}`;
}

export function dayTotalHours(day: WorkScheduleDayCreateDto): string {
    const total =
        minutesBetween(day.period1Start, day.period1End) +
        minutesBetween(day.period2Start, day.period2End);
    return total > 0 ? formatMinutesAsTime(total) : "";
}

export function dayMainBreak(day: WorkScheduleDayCreateDto): string {
    if (!day.period1End || !day.period2Start) return "";
    return `${day.period1End} às ${day.period2Start}`;
}

export function weeklyTotalHours(days: WorkScheduleDayCreateDto[]): string {
    const total = days.reduce(
        (sum, day) =>
            sum +
            minutesBetween(day.period1Start, day.period1End) +
            minutesBetween(day.period2Start, day.period2End),
        0,
    );
    return formatMinutesAsTime(total);
}
