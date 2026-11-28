import {localDateKey} from "@/modules/gp/attendance/lib/attendance-clock.util";
import {isoToDateBr, parseIsoToDate} from "@/shared/lib/input/date";

/** Semana do Histórico de ponto: bloco de 7 dias contado a partir do início do período. */
export type AttendancePeriodWeek = {
    /** Primeiro dia do bloco (ISO) — chave estável da seção. */
    key: string;
    /** 1, 2, 3… a partir do início do período. */
    number: number;
    /** "Semana 1" (telas largas). */
    label: string;
    /** "Sem. 1" (telas médias, para os atalhos caberem em uma linha). */
    shortLabel: string;
    /** Primeiro e último dia da semana dentro do período (ISO). */
    from: string;
    to: string;
    rangeLabel: string;
};

const DAYS_PER_WEEK = 7;

function addDays(date: Date, days: number): Date {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
}

function shortDate(iso: string): string {
    return isoToDateBr(iso).slice(0, 5);
}

/**
 * Semanas dentro do período selecionado, em blocos de 7 dias a partir da data inicial.
 * Ex.: 01/11 a 30/11 → 01–07, 08–14, 15–21, 22–28 e 29–30 (a última fica com o que sobra).
 */
export function attendancePeriodWeeks(from: string, to: string): AttendancePeriodWeek[] {
    const start = parseIsoToDate(from);
    const end = parseIsoToDate(to);
    if (!start || !end || start > end) return [];

    const weeks: AttendancePeriodWeek[] = [];
    for (let first = start; first <= end; first = addDays(first, DAYS_PER_WEEK)) {
        const weekFrom = localDateKey(first);
        const lastOfBlock = localDateKey(addDays(first, DAYS_PER_WEEK - 1));
        const weekTo = lastOfBlock > to ? to : lastOfBlock;
        const number = weeks.length + 1;
        weeks.push({
            key: weekFrom,
            number,
            label: `Semana ${number}`,
            shortLabel: `Sem. ${number}`,
            from: weekFrom,
            to: weekTo,
            rangeLabel:
                weekFrom === weekTo ? shortDate(weekFrom) : `${shortDate(weekFrom)} a ${shortDate(weekTo)}`,
        });
    }
    return weeks;
}

export function findAttendancePeriodWeek(
    weeks: AttendancePeriodWeek[],
    isoDate: string | null | undefined,
): AttendancePeriodWeek | undefined {
    const day = isoDate?.slice(0, 10);
    if (!day) return undefined;
    return weeks.find((week) => day >= week.from && day <= week.to);
}

/** Linha de cabeçalho da semana no grid (`data-attendance-week`), alvo da navegação por semana. */
export function attendanceWeekRowSelector(weekKey: string): string {
    return `tr[data-attendance-week="${weekKey}"]`;
}
