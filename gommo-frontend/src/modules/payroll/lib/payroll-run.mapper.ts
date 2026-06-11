import type { PayrollRun, PayrollRunCreateDto } from "@/modules/payroll/dto/payroll-run.dto";
import { currentMonthReferenceDate, isoToMonthBr, normalizeMonthIso } from "@/shared/lib/input/date";

function toDateField(value?: string): string | undefined {
    if (!value) return undefined;
    return value.slice(0, 10);
}

export function formatPayrollReference(referenceDate: string): string {
    return isoToMonthBr(referenceDate) || "—";
}

export function payrollrunToFormDto(entity: PayrollRun): PayrollRunCreateDto {
    return {
        referenceDate: normalizeMonthIso(entity.referenceDate ?? ""),
        payrollStatus: entity.payrollStatus === "DRAFT" ? "OPEN" : entity.payrollStatus,
        openedAt: toDateField(entity.openedAt),
        closedAt: toDateField(entity.closedAt),
        processedAt: entity.processedAt,
        notes: entity.notes,
    };
}

export const emptyPayrollRunForm = (): PayrollRunCreateDto => ({
    referenceDate: currentMonthReferenceDate(),
    payrollStatus: "OPEN",
});
