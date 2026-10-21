import type {
    JobRequisition,
    JobRequisitionCreateDto,
    JobRequisitionFormDto,
} from "@/modules/rh/person/jobrequisition/dto/job-requisition.dto";

function moneyToForm(value?: number | null): string {
    return value != null ? Number(value).toFixed(2) : "";
}

function moneyToPayload(value?: string): number | undefined {
    if (value == null || value === "") return undefined;
    return Number(value);
}

export function jobRequisitionToFormDto(entity: JobRequisition): JobRequisitionFormDto {
    return {
        jobPositionId: entity.jobPositionId ?? "",
        salaryLevel: entity.salaryLevel ?? undefined,
        contractType: entity.contractType ?? undefined,
        experiencePeriod: entity.experiencePeriod ?? undefined,
        positionsCount: entity.positionsCount ?? 1,
        desiredStartDate: entity.desiredStartDate?.slice(0, 10) ?? "",
        reason: entity.reason ?? "HEADCOUNT_INCREASE",
        offboardingId: entity.offboardingId ?? "",
        proposedSalary: moneyToForm(entity.proposedSalary),
        justification: entity.justification ?? "",
    };
}

export const emptyJobRequisitionForm = (): JobRequisitionFormDto => ({
    jobPositionId: "",
    positionsCount: 1,
    desiredStartDate: "",
    reason: "HEADCOUNT_INCREASE",
    offboardingId: "",
    proposedSalary: "",
    justification: "",
});

export function jobRequisitionFormToPayload(form: JobRequisitionFormDto): JobRequisitionCreateDto {
    const isReplacement = form.reason === "REPLACEMENT";
    return {
        jobPositionId: form.jobPositionId,
        salaryLevel: form.salaryLevel,
        contractType: form.contractType,
        experiencePeriod: form.contractType === "CLT" ? form.experiencePeriod : undefined,
        positionsCount: form.positionsCount,
        desiredStartDate: form.desiredStartDate?.trim() || undefined,
        reason: form.reason,
        offboardingId: isReplacement ? form.offboardingId?.trim() || undefined : undefined,
        proposedSalary: moneyToPayload(form.proposedSalary),
        justification: form.justification?.trim() || undefined,
    };
}
