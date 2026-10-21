import type { Payslip, PayslipCreateDto } from "@/modules/ctb/payroll/payslip/dto/payslip.dto";

export function payslipToFormDto(entity: Payslip): PayslipCreateDto {
    return {
        payrollRunId: entity.payrollRunId ?? "",
        collaboratorId: entity.collaboratorId ?? "",
        baseSalary: entity.baseSalary != null ? String(entity.baseSalary) : "",
        grossAmount: entity.grossAmount != null ? String(entity.grossAmount) : "",
        deductionsAmount: entity.deductionsAmount != null ? String(entity.deductionsAmount) : "",
        netAmount: entity.netAmount != null ? String(entity.netAmount) : "",
        generatedAt: entity.generatedAt,
    };
}

export const emptyPayslipForm = (): PayslipCreateDto => ({
    payrollRunId: "",
    collaboratorId: "",
    grossAmount: "",
    deductionsAmount: "",
    netAmount: "",
});
