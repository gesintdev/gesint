import type { LeaveRequest } from "@/modules/rh/person/leave/dto/leave-request.dto";
import {
    type RhVacationRow,
    toRhVacationRow,
} from "@/modules/rh/person/leave/lib/leave-request.filters";
import { concessivePeriod, inclusiveDays } from "@/modules/rh/person/vacation/lib/vacation-rules";
import { isoToDateBr } from "@/shared/lib/input/date";

export type VacationHistoryRow = RhVacationRow & {
    acquisitionPeriodLabel: string;
    concessivePeriodLabel: string;
    gozoPeriodLabel: string;
    gozoDays: number;
    daysEntitledLabel: string;
    remainingDaysLabel: string;
    pecuniaryLabel: string;
    fractionatedLabel: string;
    splitSiblings: LeaveRequest[];
};

function formatDateLabel(iso?: string | null): string {
    if (!iso) return "—";
    return isoToDateBr(iso.slice(0, 10)) || "—";
}

export function formatPeriodRange(start?: string | null, end?: string | null): string {
    if (!start || !end) return "—";
    return `${formatDateLabel(start)} → ${formatDateLabel(end)}`;
}

function resolveGozoDays(row: LeaveRequest): number {
    if (row.durationDays != null && row.durationDays > 0) {
        return row.durationDays;
    }
    if (row.startDate && row.endDate) {
        return inclusiveDays(row.startDate, row.endDate);
    }
    return 0;
}

function resolveConcessive(row: LeaveRequest): { start?: string; end?: string } {
    if (row.concessivePeriodStart && row.concessivePeriodEnd) {
        return { start: row.concessivePeriodStart, end: row.concessivePeriodEnd };
    }
    if (row.acquisitionPeriodEnd) {
        return concessivePeriod(row.acquisitionPeriodEnd);
    }
    return {};
}

/** Fracionamento real = mais de um período de gozo no mesmo grupo (até 3). */
function isFractionatedGroup(siblings: LeaveRequest[]): boolean {
    return siblings.length > 1;
}

function resolveRemainingDays(
    row: LeaveRequest,
    siblings: LeaveRequest[],
): { label: string; remaining: number | null } {
    if (!isFractionatedGroup(siblings)) {
        return { label: "—", remaining: null };
    }
    const entitled =
        siblings.find((item) => item.vacationDaysEntitled != null)?.vacationDaysEntitled ??
        row.vacationDaysEntitled ??
        0;
    // Abono é gravado apenas no primeiro período do grupo.
    const pecuniary = siblings.reduce((sum, item) => sum + (item.pecuniaryAllowanceDays ?? 0), 0);
    const groupGozo = siblings.reduce((sum, item) => sum + resolveGozoDays(item), 0);
    const remaining = Math.max(0, entitled - groupGozo - pecuniary);
    return { label: String(remaining), remaining };
}

export function enrichVacationHistoryRows(rows: LeaveRequest[]): VacationHistoryRow[] {
    const bySplitGroup = new Map<string, LeaveRequest[]>();
    for (const row of rows) {
        if (!row.splitGroupId) continue;
        const group = bySplitGroup.get(row.splitGroupId) ?? [];
        group.push(row);
        bySplitGroup.set(row.splitGroupId, group);
    }

    return rows.map((row) => {
        const siblings = row.splitGroupId
            ? [...(bySplitGroup.get(row.splitGroupId) ?? [row])].sort(
                  (a, b) => (a.splitSequence ?? 0) - (b.splitSequence ?? 0),
              )
            : [row];
        const fractionated = isFractionatedGroup(siblings);
        const concessive = resolveConcessive(row);
        const gozoDays = resolveGozoDays(row);
        const remaining = resolveRemainingDays(row, siblings);
        const rhRow = toRhVacationRow(row);

        return {
            ...rhRow,
            acquisitionPeriodLabel: formatPeriodRange(
                row.acquisitionPeriodStart,
                row.acquisitionPeriodEnd,
            ),
            concessivePeriodLabel: formatPeriodRange(concessive.start, concessive.end),
            gozoPeriodLabel: formatPeriodRange(row.startDate, row.endDate),
            gozoDays,
            daysEntitledLabel:
                row.vacationDaysEntitled != null ? String(row.vacationDaysEntitled) : "—",
            remainingDaysLabel: remaining.label,
            pecuniaryLabel:
                row.pecuniaryAllowanceDays != null ? String(row.pecuniaryAllowanceDays) : "0",
            fractionatedLabel: fractionated ? "Sim" : "Não",
            splitSiblings: siblings,
        };
    });
}
