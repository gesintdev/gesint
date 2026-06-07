import type { PayrollEvent, PayrollEventCreateDto } from "@/modules/payroll/payroll-event/dto/payroll-event.dto";

export function payrollEventToFormDto(entity: PayrollEvent): PayrollEventCreateDto {
    return {
        eventCode: entity.eventCode ?? "",
        description: entity.description ?? "",
        eventType: entity.eventType ?? "EARNING",
        incidesInss: entity.incidesInss ?? false,
        incidesFgts: entity.incidesFgts ?? false,
        incidesIrrf: entity.incidesIrrf ?? false,
        formula: entity.formula,
    };
}

export const emptyPayrollEventForm = (): PayrollEventCreateDto => ({
    eventCode: "",
    description: "",
    eventType: "EARNING",
    incidesInss: false,
    incidesFgts: false,
    incidesIrrf: false,
    formula: "",
});
