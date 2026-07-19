import { isNationalHoliday, isWeeklyRestDay } from "@/modules/rh/person/vacation/lib/brazil-calendar";
import type {
    DateRange,
    VacationPaymentEstimate,
    VacationPeriodStatus,
    VacationSplitPeriod,
} from "@/modules/rh/person/vacation/types/vacation.types";

export type AcquisitionPeriodOption = {
    periodIndex: number;
    acquisition: DateRange;
    concessive: DateRange;
    status: VacationPeriodStatus;
    entitledDays: number;
};

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

export function endDateFromStartAndDays(startDate: string, days: number): string {
    if (!startDate || days <= 0) return "";
    const end = parseIsoDate(startDate);
    end.setDate(end.getDate() + days - 1);
    return formatIsoDate(end);
}

export function syncPeriodWithDays(period: VacationSplitPeriod): VacationSplitPeriod {
    if (!period.startDate || period.days <= 0) {
        return { ...period, endDate: "" };
    }
    return { ...period, endDate: endDateFromStartAndDays(period.startDate, period.days) };
}

export function syncPeriodsWithDefaultDays(
    periods: VacationSplitPeriod[],
    availableDays: number,
): VacationSplitPeriod[] {
    return periods.map((period, index) => {
        if (!period.startDate || period.days > 0) {
            return syncPeriodWithDays(period);
        }
        const usedByOtherPeriods = periods.reduce((sum, current, currentIndex) => {
            if (currentIndex === index) return sum;
            return sum + Math.max(0, current.days);
        }, 0);
        const defaultDays = Math.max(0, availableDays - usedByOtherPeriods);
        return syncPeriodWithDays({ ...period, days: defaultDays });
    });
}

export function totalGozoDays(periods: VacationSplitPeriod[]): number {
    return periods.filter((p) => p.days > 0).reduce((sum, p) => sum + p.days, 0);
}

export type VacationBalanceSummary = {
    entitledDays: number;
    gozoDays: number;
    pecuniaryDays: number;
    allocatedDays: number;
    remainingDays: number;
};

export function summarizeVacationBalance(
    entitledDays: number,
    periods: VacationSplitPeriod[],
    pecuniaryDays: number,
): VacationBalanceSummary {
    const gozoDays = totalGozoDays(periods);
    const allocatedDays = gozoDays + pecuniaryDays;
    return {
        entitledDays,
        gozoDays,
        pecuniaryDays,
        allocatedDays,
        remainingDays: entitledDays - allocatedDays,
    };
}

export function daysUntilDate(targetIso: string, referenceIso = formatIsoDate(new Date())): number {
    const target = parseIsoDate(targetIso);
    const ref = parseIsoDate(referenceIso);
    return Math.round((target.getTime() - ref.getTime()) / 86_400_000);
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

/** Períodos aquisitivos selecionáveis (mais recente primeiro), até o período ativo atual. */
export function listAcquisitionPeriodOptions(
    hireDate: string,
    unjustifiedAbsences: number,
    referenceDate = formatIsoDate(new Date()),
): AcquisitionPeriodOption[] {
    const entitledDays = vacationDaysEntitled(unjustifiedAbsences);
    const activeIndex = resolveActivePeriodIndex(hireDate, referenceDate);
    const options: AcquisitionPeriodOption[] = [];
    for (let index = 0; index <= activeIndex; index += 1) {
        const acquisition = acquisitionPeriod(hireDate, index);
        const concessive = concessivePeriod(acquisition.end);
        options.push({
            periodIndex: index,
            acquisition,
            concessive,
            status: resolvePeriodStatus(acquisition, concessive, entitledDays, referenceDate),
            entitledDays,
        });
    }
    return options.reverse();
}

export function resolvePeriodStatus(
    acquisition: { start: string; end: string },
    concessive: { start: string; end: string },
    entitledDays: number,
    referenceDate = formatIsoDate(new Date()),
): import("@/modules/rh/person/vacation/types/vacation.types").VacationPeriodStatus {
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
    const dayCounts = periods.filter((p) => p.days > 0).map((p) => p.days);
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
        const followingRestOrHoliday = new Date(start);
        followingRestOrHoliday.setDate(followingRestOrHoliday.getDate() + i);
        if (isWeeklyRestDay(followingRestOrHoliday) || isNationalHoliday(followingRestOrHoliday)) return true;
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
