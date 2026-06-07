import type { PayrollRun, PayrollRunCreateDto } from "@/modules/payroll/dto/payroll-run.dto";

function toDateField(value?: string): string | undefined {
    if (!value) return undefined;
    return value.slice(0, 10);
}

export function formatPayrollReference(month: number, year: number): string {
    return `${String(month).padStart(2, "0")}/${year}`;
}

export function payrollrunToFormDto(entity: PayrollRun): PayrollRunCreateDto {
    return {
        companyId: entity.companyId,
        referenceYear: entity.referenceYear ?? 0,
        referenceMonth: entity.referenceMonth ?? 0,
        payrollStatus: entity.payrollStatus === "DRAFT" ? "OPEN" : entity.payrollStatus,
        openedAt: toDateField(entity.openedAt),
        closedAt: toDateField(entity.closedAt),
        processedAt: entity.processedAt,
        notes: entity.notes,
    };
}

export const emptyPayrollRunForm = (): PayrollRunCreateDto => ({
    referenceYear: new Date().getFullYear(),
    referenceMonth: new Date().getMonth() + 1,
    payrollStatus: "OPEN",
});
