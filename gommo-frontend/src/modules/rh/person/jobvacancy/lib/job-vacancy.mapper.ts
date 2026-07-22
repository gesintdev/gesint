import type { JobVacancy, JobVacancyCreateDto } from "@/modules/rh/person/jobvacancy/dto/job-vacancy.dto";

export function jobVacancyToFormDto(entity: JobVacancy): JobVacancyCreateDto {
    return {
        jobPositionId: entity.jobPositionId ?? null,
        jobTitle: entity.jobTitle ?? "",
        positionsCount: entity.positionsCount ?? 1,
        description: entity.description ?? "",
        activities: entity.activities ?? "",
        assignments: entity.assignments ?? "",
        seniorityLevel: entity.seniorityLevel,
        salary: entity.salary != null ? String(entity.salary) : "",
        expectedCompletionDate: entity.expectedCompletionDate?.slice(0, 10) ?? "",
        targetBoards: entity.targetBoards ?? [],
    };
}

export const emptyJobVacancyForm = (): JobVacancyCreateDto => ({
    jobPositionId: null,
    jobTitle: "",
    positionsCount: 1,
    description: "",
    activities: "",
    assignments: "",
    salary: "",
    expectedCompletionDate: "",
    targetBoards: [],
});

export function jobVacancyFormToPayload(form: JobVacancyCreateDto): JobVacancyCreateDto {
    return {
        ...form,
        jobPositionId: form.jobPositionId?.trim() || null,
        jobTitle: form.jobTitle.trim(),
        description: form.description?.trim() || undefined,
        activities: form.activities?.trim() || undefined,
        assignments: form.assignments?.trim() || undefined,
        salary:
            form.salary != null && form.salary !== ""
                ? Number(form.salary)
                : undefined,
        expectedCompletionDate: form.expectedCompletionDate?.trim() || undefined,
        targetBoards: form.targetBoards ?? [],
    };
}
