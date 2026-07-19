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
    expectedCompletionDate: "",
    targetBoards: [],
});
