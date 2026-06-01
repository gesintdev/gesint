import type { LeaveRequest, LeaveRequestCreateDto } from "@/modules/person/leave/dto/leave-request.dto";
import type { VacationRequestFormSchema } from "@/modules/person/vacation/schemas/vacation-request.schema";
import { totalGozoDays, vacationDaysEntitled } from "@/modules/person/vacation/lib/vacation-rules";

export type VacationFormState = VacationRequestFormSchema & {
    vacationDaysEntitled?: number;
};

export function emptyVacationForm(): VacationFormState {
    return {
        collaboratorId: "",
        unjustifiedAbsences: 0,
        pecuniaryAllowanceDays: 0,
        approved: true,
        notes: "",
        periods: [{ startDate: "", endDate: "" }],
        acquisitionPeriodStart: "",
        acquisitionPeriodEnd: "",
        baseSalarySnapshot: undefined,
        vacationDaysEntitled: 30,
    };
}

export function leaveToVacationForm(entity: LeaveRequest): VacationFormState {
    return {
        collaboratorId: entity.collaboratorId ?? "",
        unjustifiedAbsences: entity.unjustifiedAbsences ?? 0,
        pecuniaryAllowanceDays: entity.pecuniaryAllowanceDays ?? 0,
        approved: entity.approved ?? true,
        notes: entity.notes ?? "",
        periods: [{ startDate: entity.startDate?.slice(0, 10) ?? "", endDate: entity.endDate?.slice(0, 10) ?? "" }],
        acquisitionPeriodStart: entity.acquisitionPeriodStart?.slice(0, 10) ?? "",
        acquisitionPeriodEnd: entity.acquisitionPeriodEnd?.slice(0, 10) ?? "",
        baseSalarySnapshot: entity.baseSalarySnapshot != null ? Number(entity.baseSalarySnapshot) : undefined,
        vacationDaysEntitled: entity.vacationDaysEntitled ?? vacationDaysEntitled(entity.unjustifiedAbsences ?? 0),
    };
}

/** Um registro por período de gozo (fracionamento). */
export function vacationFormToLeaveDtos(
    form: VacationRequestFormSchema,
    splitGroupId: string,
): LeaveRequestCreateDto[] {
    const entitled = vacationDaysEntitled(form.unjustifiedAbsences);
    return form.periods
        .filter((p) => p.startDate && p.endDate)
        .map((period, index) => ({
            collaboratorId: form.collaboratorId,
            leaveType: "VACATION" as const,
            startDate: period.startDate,
            endDate: period.endDate,
            approved: form.approved ?? true,
            notes: form.notes,
            pecuniaryAllowanceDays: index === 0 ? form.pecuniaryAllowanceDays : 0,
            unjustifiedAbsences: form.unjustifiedAbsences,
            vacationDaysEntitled: entitled,
            acquisitionPeriodStart: form.acquisitionPeriodStart || undefined,
            acquisitionPeriodEnd: form.acquisitionPeriodEnd || undefined,
            splitGroupId,
            splitSequence: index + 1,
            baseSalarySnapshot: form.baseSalarySnapshot,
        }));
}

export function vacationFormToSingleLeaveDto(form: VacationRequestFormSchema): LeaveRequestCreateDto {
    const [first] = vacationFormToLeaveDtos(form, crypto.randomUUID());
    return first;
}

export function summarizeGozoDays(form: VacationRequestFormSchema): number {
    return totalGozoDays(form.periods);
}
