import type { PayrollRun, PayrollRunCreateDto } from "@/modules/payroll/dto/payroll-run.dto";

export function payrollrunToFormDto(entity: PayrollRun): PayrollRunCreateDto {
    return {
        referenceYear: entity.referenceYear ?? 0,
        referenceMonth: entity.referenceMonth ?? 0,
        payrollStatus: entity.payrollStatus,
    };
}

export const emptyPayrollRunForm = (): PayrollRunCreateDto => ({
    referenceYear: 0,
    referenceMonth: 0,
});
