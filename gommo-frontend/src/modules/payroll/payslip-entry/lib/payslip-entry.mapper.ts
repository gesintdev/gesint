import type { PayslipEntry, PayslipEntryCreateDto } from "@/modules/payroll/payslip-entry/dto/payslip-entry.dto";

export function payslipEntryToFormDto(entity: PayslipEntry): PayslipEntryCreateDto {
    return {
        payslipId: entity.payslipId ?? "",
        payrollEventId: entity.payrollEventId ?? "",
        quantity: entity.quantity != null ? String(entity.quantity) : "1",
        unitValue: entity.unitValue != null ? String(entity.unitValue) : "",
        totalValue: entity.totalValue != null ? String(entity.totalValue) : "",
    };
}

export const emptyPayslipEntryForm = (): PayslipEntryCreateDto => ({
    payslipId: "",
    payrollEventId: "",
    quantity: "1",
    unitValue: "",
    totalValue: "",
});
