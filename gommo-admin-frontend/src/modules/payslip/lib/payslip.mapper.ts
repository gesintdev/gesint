import type { Payslip, PayslipCreateDto } from "@/modules/payslip/dto/payslip.dto";

export function payslipToFormDto(entity: Payslip): PayslipCreateDto {
    return {
        payrollRunId: entity.payrollRunId ?? "",
        collaboratorId: entity.collaboratorId ?? "",
        grossAmount: entity.grossAmount != null ? String(entity.grossAmount) : "",
        netAmount: entity.netAmount != null ? String(entity.netAmount) : "",
    };
}

export const emptyPayslipForm = (): PayslipCreateDto => ({
    payrollRunId: "",
    collaboratorId: "",
    grossAmount: "",
    netAmount: "",
});
