import type { VacationPaymentEstimate, VacationSplitPeriod } from "@/modules/person/vacation/types/vacation.types";
import { isNationalHoliday, isWeeklyRestDay } from "@/modules/person/vacation/lib/brazil-calendar";

export const MAX_PECUNIARY_DAYS = 10;
export const MAX_SPLIT_PERIODS = 3;
export const MIN_MAIN_SPLIT_DAYS = 14;
export const MIN_OTHER_SPLIT_DAYS = 5;

export function parseIsoDate(value: string): Date {
    const [y, m, d] = value.slice(0, 10).split("-").map(Number);
    return new Date(y, m - 1, d);
}

export function formatIsoDate(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export function inclusiveDays(start: string, end: string): number {
    const a = parseIsoDate(start);
    const b = parseIsoDate(end);
    const diff = Math.round((b.getTime() - a.getTime()) / 86_400_000);
    return diff + 1;
}

export function vacationDaysEntitled(unjustifiedAbsences: number): number {
    if (unjustifiedAbsences <= 5) return 30;
    if (unjustifiedAbsences <= 14) return 24;
    if (unjustifiedAbsences <= 23) return 18;
    if (unjustifiedAbsences <= 32) return 12;
    return 0;
}

export function addMonths(date: Date, months: number): Date {
    const next = new Date(date);
    next.setMonth(next.getMonth() + months);
    return next;
}

export function acquisitionPeriod(hireDate: string, periodIndex = 0): { start: string; end: string } {
    const hire = parseIsoDate(hireDate);
    const start = addMonths(hire, 12 * periodIndex);
    const end = addMonths(start, 12);
    end.setDate(end.getDate() - 1);
    return { start: formatIsoDate(start), end: formatIsoDate(end) };
}

export function concessivePeriod(acquisitionEnd: string): { start: string; end: string } {
    const endAcq = parseIsoDate(acquisitionEnd);
    const start = new Date(endAcq);
    start.setDate(start.getDate() + 1);
    const end = addMonths(start, 12);
    end.setDate(end.getDate() - 1);
    return { start: formatIsoDate(start), end: formatIsoDate(end) };
}

/** Índice do período aquisitivo vigente (0 = primeiro ano de trabalho). */
export function resolveActivePeriodIndex(hireDate: string, referenceDate = formatIsoDate(new Date())): number {
    const ref = parseIsoDate(referenceDate);
    let index = 0;
    while (index < 40) {
        const acquisition = acquisitionPeriod(hireDate, index);
        const concessive = concessivePeriod(acquisition.end);
        if (ref <= parseIsoDate(concessive.end)) {
            return index;
        }
        index += 1;
    }
    return Math.max(0, index - 1);
}

export function resolvePeriodStatus(
    acquisition: { start: string; end: string },
    concessive: { start: string; end: string },
    entitledDays: number,
    referenceDate = formatIsoDate(new Date()),
): import("@/modules/person/vacation/types/vacation.types").VacationPeriodStatus {
    if (entitledDays <= 0) return "FORFEITED";
    const ref = parseIsoDate(referenceDate);
    const acqEnd = parseIsoDate(acquisition.end);
    const concEnd = parseIsoDate(concessive.end);
    if (ref <= acqEnd) return "ACQUIRING";
    if (ref > concEnd) return "EXPIRED";
    const concStart = parseIsoDate(concessive.start);
    if (ref < concStart) return "AVAILABLE";
    return "CONCESSIVE";
}

export function maxPecuniaryDays(entitledDays: number): number {
    return Math.min(MAX_PECUNIARY_DAYS, Math.floor(entitledDays / 3));
}

export function validateSplitPeriods(periods: VacationSplitPeriod[]): { valid: boolean; message?: string } {
    const dayCounts = periods
        .filter((p) => p.startDate && p.endDate)
        .map((p) => inclusiveDays(p.startDate, p.endDate));

    if (dayCounts.length === 0) {
        return { valid: false, message: "Informe ao menos um período de gozo." };
    }
    if (dayCounts.length > MAX_SPLIT_PERIODS) {
        return { valid: false, message: "É permitido fracionar em até 3 períodos." };
    }
    if (dayCounts.length === 1) return { valid: true };

    const hasMain = dayCounts.some((d) => d >= MIN_MAIN_SPLIT_DAYS);
    const allValid = dayCounts.every((d) => d >= MIN_OTHER_SPLIT_DAYS);
    if (!hasMain || !allValid) {
        return {
            valid: false,
            message:
                "No fracionamento, um período deve ter no mínimo 14 dias corridos e os demais, no mínimo 5 dias cada.",
        };
    }
    return { valid: true };
}

export function isRestrictedVacationStart(startDate: string): boolean {
    const start = parseIsoDate(startDate);
    for (let i = 1; i <= 2; i++) {
        const check = new Date(start);
        check.setDate(check.getDate() - i);
        if (isWeeklyRestDay(check) || isNationalHoliday(check)) return true;
    }
    return false;
}

export function paymentDeadline(vacationStart: string): string {
    const d = parseIsoDate(vacationStart);
    d.setDate(d.getDate() - 2);
    return formatIsoDate(d);
}

export function estimateVacationPayment(
    baseSalary: number,
    vacationDaysUsed: number,
    pecuniaryDays: number,
    firstPeriodStart?: string,
): VacationPaymentEstimate {
    if (!baseSalary || baseSalary <= 0) {
        return { vacationPay: 0, constitutionalThird: 0, grossTotal: 0, paymentDeadline: null };
    }
    const daily = baseSalary / 30;
    const totalDays = vacationDaysUsed + pecuniaryDays;
    const vacationPay = Math.round(daily * totalDays * 100) / 100;
    const constitutionalThird = Math.round((vacationPay / 3) * 100) / 100;
    return {
        vacationPay,
        constitutionalThird,
        grossTotal: Math.round((vacationPay + constitutionalThird) * 100) / 100,
        paymentDeadline: firstPeriodStart ? paymentDeadline(firstPeriodStart) : null,
    };
}

export function totalGozoDays(periods: VacationSplitPeriod[]): number {
    return periods
        .filter((p) => p.startDate && p.endDate)
        .reduce((sum, p) => sum + inclusiveDays(p.startDate, p.endDate), 0);
}
