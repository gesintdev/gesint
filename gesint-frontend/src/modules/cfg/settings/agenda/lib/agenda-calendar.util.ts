const WEEKDAY_SHORT = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"] as const;
const WEEKDAY_LONG = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
] as const;
const MONTH_LONG = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
] as const;

export const AGENDA_HOUR_START = 0;
export const AGENDA_HOUR_END = 24;
export const AGENDA_SLOT_PX = 56;

function startOfDay(date: Date) {
    const next = new Date(date);
    next.setHours(0, 0, 0, 0);
    return next;
}

function addDays(date: Date, days: number) {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
}

/** Segunda-feira da semana de trabalho que contém a data. */
export function startOfWorkWeek(date: Date) {
    const day = startOfDay(date);
    const weekday = day.getDay(); // 0=Dom
    const offset = weekday === 0 ? -6 : 1 - weekday;
    return addDays(day, offset);
}

export function workWeekDays(anchor: Date) {
    const monday = startOfWorkWeek(anchor);
    return Array.from({length: 5}, (_, index) => addDays(monday, index));
}

export function workWeekRangeLabel(anchor: Date) {
    const days = workWeekDays(anchor);
    const first = days[0];
    const last = days[days.length - 1];
    if (first.getMonth() === last.getMonth()) {
        return `${first.getDate()} - ${last.getDate()} de ${MONTH_LONG[first.getMonth()]} de ${first.getFullYear()}`;
    }
    return `${first.getDate()} de ${MONTH_LONG[first.getMonth()]} - ${last.getDate()} de ${MONTH_LONG[last.getMonth()]} de ${last.getFullYear()}`;
}

export function dayHeaderLabel(date: Date) {
    return `${date.getDate()} ${WEEKDAY_LONG[date.getDay()]}`;
}

export function dayNumberLabel(date: Date) {
    return String(date.getDate());
}

export function dayWeekdayLabel(date: Date) {
    return WEEKDAY_LONG[date.getDay()];
}

export function isSameDay(a: Date, b: Date) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

/** Dias da semana de trabalho (seg–sex) exibidos na grade — usados no destaque do mini calendário. */
export function visibleWeekHighlightDays(anchor: Date) {
    return workWeekDays(anchor);
}

/** Chave estável em calendário local (evita deslocar dia via toISOString/UTC). */
export function localDateKey(date: Date) {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}`;
}

export function toOffsetIso(date: Date) {
    return date.toISOString();
}

export function workWeekQueryBounds(anchor: Date) {
    const monday = startOfWorkWeek(anchor);
    const saturday = addDays(monday, 5);
    return {
        from: toOffsetIso(monday),
        to: toOffsetIso(saturday),
    };
}

export function pad2(value: number) {
    return String(value).padStart(2, "0");
}

export function toLocalDatetimeValue(date: Date) {
    return `${date.getFullYear()}-${pad2(date.getMonth() + 1)}-${pad2(date.getDate())}T${pad2(date.getHours())}:${pad2(date.getMinutes())}`;
}

export function fromLocalDatetimeValue(value: string) {
    if (!value) return null;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
}

export function offsetIsoToLocalDatetime(iso: string) {
    const date = new Date(iso);
    if (Number.isNaN(date.getTime())) return "";
    return toLocalDatetimeValue(date);
}

export function localDatetimeToOffsetIso(local: string) {
    const date = fromLocalDatetimeValue(local);
    if (!date) return "";
    return date.toISOString();
}

export function minutesFromDayStart(date: Date) {
    return date.getHours() * 60 + date.getMinutes();
}

export function eventTopPx(startsAt: string) {
    const date = new Date(startsAt);
    if (Number.isNaN(date.getTime())) return 0;
    return (minutesFromDayStart(date) / 60) * AGENDA_SLOT_PX;
}

export function eventHeightPx(startsAt: string, endsAt: string) {
    const start = new Date(startsAt);
    const end = new Date(endsAt);
    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return AGENDA_SLOT_PX / 2;
    const minutes = Math.max(15, (end.getTime() - start.getTime()) / 60000);
    return (minutes / 60) * AGENDA_SLOT_PX;
}

export function defaultEventRange(slotStart?: Date) {
    const start = slotStart ? new Date(slotStart) : new Date();
    start.setSeconds(0, 0);
    if (!slotStart) {
        const minutes = start.getMinutes();
        start.setMinutes(minutes < 30 ? 0 : 30);
    }
    const end = new Date(start);
    end.setMinutes(end.getMinutes() + 30);
    return {
        startsAt: toLocalDatetimeValue(start),
        endsAt: toLocalDatetimeValue(end),
    };
}

export function monthMatrix(year: number, month: number) {
    const first = new Date(year, month, 1);
    const start = addDays(first, -((first.getDay() + 6) % 7)); // Monday-first grid
    return Array.from({length: 6}, (_, week) =>
        Array.from({length: 7}, (_, day) => addDays(start, week * 7 + day)),
    );
}

export function monthTitle(year: number, month: number) {
    return `${MONTH_LONG[month]} ${year}`;
}

/** Labels alinhados à grade Monday-first do mini calendário. */
export function weekdayShortLabels() {
    return ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"] as const;
}

export {WEEKDAY_SHORT, addDays, startOfDay};
