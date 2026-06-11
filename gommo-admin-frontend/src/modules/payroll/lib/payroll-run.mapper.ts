import type { PayrollRun, PayrollRunCreateDto } from "@/modules/payroll/dto/payroll-run.dto";
import { currentMonthReferenceDate, normalizeMonthIso } from "@/shared/lib/input/date";

export function payrollrunToFormDto(entity: PayrollRun): PayrollRunCreateDto {
    return {
        referenceDate: normalizeMonthIso(entity.referenceDate ?? ""),
        payrollStatus: entity.payrollStatus,
    };
}

export const emptyPayrollRunForm = (): PayrollRunCreateDto => ({
    referenceDate: currentMonthReferenceDate(),
});
