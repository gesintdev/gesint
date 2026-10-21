import type {
    JobVacancyApplication,
    JobVacancyApplicationCreateDto,
} from "@/modules/rh/person/jobvacancyapplication/dto/job-vacancy-application.dto";

export function jobVacancyApplicationToFormDto(entity: JobVacancyApplication): JobVacancyApplicationCreateDto {
    return {
        jobVacancyId: entity.jobVacancyId ?? "",
        candidateId: entity.candidateId ?? "",
        applicationStatus: entity.applicationStatus ?? "APPLIED",
        appliedAt: entity.appliedAt ?? "",
    };
}

export const emptyJobVacancyApplicationForm = (): JobVacancyApplicationCreateDto => ({
    jobVacancyId: "",
    candidateId: "",
    applicationStatus: "APPLIED",
    appliedAt: "",
});

export function jobVacancyApplicationFormToPayload(
    form: JobVacancyApplicationCreateDto,
): JobVacancyApplicationCreateDto {
    return {
        jobVacancyId: form.jobVacancyId,
        candidateId: form.candidateId,
        applicationStatus: form.applicationStatus || "APPLIED",
        appliedAt: form.appliedAt?.trim() || undefined,
    };
}
