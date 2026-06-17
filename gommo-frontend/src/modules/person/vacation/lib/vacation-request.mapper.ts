import type { LeaveRequest, LeaveRequestCreateDto } from "@/modules/person/leave/dto/leave-request.dto";
import {
    inclusiveDays,
    syncPeriodWithDays,
    totalGozoDays,
    vacationDaysEntitled,
} from "@/modules/person/vacation/lib/vacation-rules";
import type { VacationRequestFormSchema } from "@/modules/person/vacation/schemas/vacation-request.schema";

export type VacationFormState = VacationRequestFormSchema & {
    vacationDaysEntitled?: number;
};

export function emptyVacationForm(): VacationFormState {
    return {
        collaboratorId: "",
        unjustifiedAbsences: 0,
        justifiedAbsences: 0,
        pecuniaryAllowanceDays: 0,
        approved: true,
        notes: "",
        periods: [{ startDate: "", endDate: "", days: 0 }],
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
        justifiedAbsences: entity.justifiedAbsences ?? 0,
        pecuniaryAllowanceDays: entity.pecuniaryAllowanceDays ?? 0,
        approved: entity.approved ?? true,
        notes: entity.notes ?? "",
        periods: [
            syncPeriodWithDays({
                startDate: entity.startDate?.slice(0, 10) ?? "",
                endDate: entity.endDate?.slice(0, 10) ?? "",
                days:
                    entity.startDate && entity.endDate
                        ? inclusiveDays(entity.startDate.slice(0, 10), entity.endDate.slice(0, 10))
                        : 0,
            }),
        ],
        acquisitionPeriodStart: entity.acquisitionPeriodStart?.slice(0, 10) ?? "",
        acquisitionPeriodEnd: entity.acquisitionPeriodEnd?.slice(0, 10) ?? "",
        baseSalarySnapshot: entity.baseSalarySnapshot != null ? Number(entity.baseSalarySnapshot) : undefined,
        vacationDaysEntitled: entity.vacationDaysEntitled ?? vacationDaysEntitled(entity.unjustifiedAbsences ?? 0),
    };
}

export function vacationFormToLeaveDtos(
    form: VacationRequestFormSchema,
    splitGroupId: string,
): LeaveRequestCreateDto[] {
    const entitled = vacationDaysEntitled(form.unjustifiedAbsences);
    return form.periods
        .filter((p) => p.startDate && p.days > 0)
        .map((period, index) => {
            const synced = syncPeriodWithDays(period);
            return {
                collaboratorId: form.collaboratorId,
                leaveType: "VACATION" as const,
                startDate: synced.startDate,
                endDate: synced.endDate,
                approved: form.approved ?? true,
                notes: form.notes,
                pecuniaryAllowanceDays: index === 0 ? form.pecuniaryAllowanceDays : 0,
                unjustifiedAbsences: form.unjustifiedAbsences,
                justifiedAbsences: form.justifiedAbsences,
                vacationDaysEntitled: entitled,
                acquisitionPeriodStart: form.acquisitionPeriodStart || undefined,
                acquisitionPeriodEnd: form.acquisitionPeriodEnd || undefined,
                splitGroupId,
                splitSequence: index + 1,
                baseSalarySnapshot: form.baseSalarySnapshot,
                reviewStatus: form.approved ? ("APPROVED" as const) : ("PENDING" as const),
            };
        });
}

export function vacationFormToSingleLeaveDto(form: VacationRequestFormSchema): LeaveRequestCreateDto {
    const [first] = vacationFormToLeaveDtos(form, crypto.randomUUID());
    return first;
}

export function vacationFormToRhLeaveDtos(
    form: VacationRequestFormSchema,
    splitGroupId: string,
): LeaveRequestCreateDto[] {
    return vacationFormToLeaveDtos({ ...form, approved: false }, splitGroupId).map((dto, index) => ({
        ...dto,
        approved: false,
        reviewStatus: "PENDING" as const,
        justifiedAbsences: index === 0 ? form.justifiedAbsences : undefined,
    }));
}

export function summarizeGozoDays(form: VacationRequestFormSchema): number {
    return totalGozoDays(form.periods);
}
