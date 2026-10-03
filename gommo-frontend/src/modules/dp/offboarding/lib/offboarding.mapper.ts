import type {
    Offboarding,
    OffboardingChecklistItemDto,
    OffboardingCreateDto,
} from "@/modules/dp/offboarding/dto/offboarding.dto";
import {ACCESS_CHECKLIST_ITEMS} from "@/modules/dp/offboarding/lib/offboarding.options";
import type {ExitInterviewReturnChecklistConfig} from "@/modules/cfg/settings/exitinterviewchecklist/dto/exit-interview-return-checklist-config.dto";

function cloneChecklist(items?: OffboardingChecklistItemDto[]): OffboardingChecklistItemDto[] {
    return (items ?? []).map((item) => ({
        key: item.key,
        description: item.description,
        category: item.category,
        status: item.status ?? "PENDING",
        returnedAt: item.returnedAt ?? "",
        notes: item.notes ?? "",
    }));
}

export function buildDefaultExitChecklist(
    cfgItems?: ExitInterviewReturnChecklistConfig[],
): OffboardingChecklistItemDto[] {
    const returns = (cfgItems ?? []).map((item) => ({
        key: item.itemKey,
        description: item.description,
        category: "RETURN" as const,
        status: "PENDING" as const,
        returnedAt: "",
        notes: "",
    }));
    const access = ACCESS_CHECKLIST_ITEMS.map((item) => ({
        key: item.key,
        description: item.description,
        category: item.category,
        status: "PENDING" as const,
        returnedAt: "",
        notes: "",
    }));
    return [...returns, ...access];
}

/** Mantém respostas já marcadas e acrescenta itens CFG/acesso ausentes. */
export function mergeExitChecklist(
    existing: OffboardingChecklistItemDto[] | undefined,
    cfgItems?: ExitInterviewReturnChecklistConfig[],
): OffboardingChecklistItemDto[] {
    const defaults = buildDefaultExitChecklist(cfgItems);
    if (!existing?.length) return defaults;
    const byKey = new Map(existing.map((item) => [item.key, item]));
    return defaults.map((def) => {
        const prev = byKey.get(def.key);
        if (!prev) return def;
        return {
            ...def,
            status: prev.status ?? "PENDING",
            returnedAt: prev.returnedAt ?? "",
            notes: prev.notes ?? "",
        };
    });
}

export function offboardingToFormDto(entity: Offboarding): OffboardingCreateDto {
    const lastWorkDay = entity.lastWorkDay?.slice(0, 10) || entity.dismissalDate?.slice(0, 10) || "";
    return {
        collaboratorId: entity.collaboratorId,
        dismissalDate: entity.dismissalDate?.slice(0, 10) || lastWorkDay,
        dismissalType: entity.dismissalType,
        dismissalNotes: entity.dismissalNotes ?? "",
        homologationNotes: entity.homologationNotes ?? "",
        esocialDismissalReasonCode: entity.esocialDismissalReasonCode ?? "",
        lastWorkDay,
        noticeType: entity.noticeType,
        noticeDays: entity.noticeDays,
        noticeStartDate: entity.noticeStartDate?.slice(0, 10) ?? "",
        noticeEndDate: entity.noticeEndDate?.slice(0, 10) ?? "",
        workloadReductionApplicable: entity.workloadReductionApplicable,
        exitChecklist: cloneChecklist(entity.exitChecklist),
        exitInterviewId: entity.exitInterviewId ?? "",
        demissionalWaiverRegistered: entity.demissionalWaiverRegistered,
        demissionalWaiverNotes: entity.demissionalWaiverNotes ?? "",
    };
}

export const emptyOffboardingForm = (): OffboardingCreateDto => ({
    collaboratorId: "",
    dismissalDate: "",
    lastWorkDay: "",
    dismissalNotes: "",
    homologationNotes: "",
    esocialDismissalReasonCode: "",
    exitChecklist: [],
    exitInterviewId: "",
    demissionalWaiverNotes: "",
});

export function toOffboardingPayload(form: OffboardingCreateDto): OffboardingCreateDto {
    const lastWorkDay = form.lastWorkDay?.trim() || form.dismissalDate?.trim() || "";
    return {
        collaboratorId: form.collaboratorId,
        dismissalDate: form.dismissalDate?.trim() || lastWorkDay,
        lastWorkDay: lastWorkDay || undefined,
        dismissalType: form.dismissalType,
        dismissalNotes: form.dismissalNotes?.trim() || undefined,
        homologationNotes: form.homologationNotes?.trim() || undefined,
        esocialDismissalReasonCode: form.esocialDismissalReasonCode?.trim() || undefined,
        noticeType: form.noticeType,
        noticeDays: form.noticeDays,
        noticeStartDate: form.noticeStartDate?.trim() || undefined,
        noticeEndDate: form.noticeEndDate?.trim() || undefined,
        workloadReductionApplicable: form.workloadReductionApplicable,
        exitChecklist: cloneChecklist(form.exitChecklist),
        exitInterviewId: form.exitInterviewId?.trim() || undefined,
        demissionalWaiverRegistered: form.demissionalWaiverRegistered,
        demissionalWaiverNotes: form.demissionalWaiverNotes?.trim() || undefined,
    };
}
