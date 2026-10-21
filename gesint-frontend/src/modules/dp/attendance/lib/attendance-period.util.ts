import {dateToIso} from "@/shared/lib/input/date";

export function currentMonthBounds(): {from: string; to: string} {
    const now = new Date();
    const from = dateToIso(new Date(now.getFullYear(), now.getMonth(), 1));
    const to = dateToIso(new Date(now.getFullYear(), now.getMonth() + 1, 0));
    return {from, to};
}

export function normalizePeriod(from: string, to: string): {from: string; to: string} {
    if (from && to && from > to) {
        return {from: to, to: from};
    }
    return {from, to};
}

/**
 * Desloca o período em `deltaMonths` meses de calendário.
 * Âncora: mês de `from` (mesmo se o range atravessar vários meses).
 * Resultado: primeiro e último dia do mês-alvo.
 */
export function shiftPeriodMonth(from: string, deltaMonths: number): {from: string; to: string} {
    const now = new Date();
    let year = now.getFullYear();
    let monthIndex = now.getMonth();

    if (from) {
        const [y, m] = from.split("-");
        const parsedY = Number(y);
        const parsedM = Number(m);
        if (Number.isFinite(parsedY) && Number.isFinite(parsedM) && parsedM >= 1 && parsedM <= 12) {
            year = parsedY;
            monthIndex = parsedM - 1;
        }
    }

    const target = new Date(year, monthIndex + deltaMonths, 1);
    return {
        from: dateToIso(new Date(target.getFullYear(), target.getMonth(), 1)),
        to: dateToIso(new Date(target.getFullYear(), target.getMonth() + 1, 0)),
    };
}
