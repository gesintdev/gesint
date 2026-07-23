import type { JobVacancy, JobVacancyCreateDto } from "@/modules/rh/person/jobvacancy/dto/job-vacancy.dto";
import { slugFromJobTitle } from "@/modules/rh/person/jobvacancy/lib/job-vacancy-slug";

function moneyToForm(value?: number | null): string {
    return value != null ? String(value) : "";
}

function moneyToPayload(value?: string | number): number | undefined {
    if (value == null || value === "") return undefined;
    return Number(value);
}

export function jobVacancyToFormDto(entity: JobVacancy): JobVacancyCreateDto {
    return {
        jobPositionId: entity.jobPositionId ?? null,
        jobTitle: entity.jobTitle ?? "",
        positionsCount: entity.positionsCount ?? 1,
        description: entity.description ?? "",
        activities: entity.activities ?? "",
        assignments: entity.assignments ?? "",
        requirements: entity.requirements ?? "",
        benefits: entity.benefits ?? "",
        department: entity.department ?? "",
        location: entity.location ?? "",
        workModality: entity.workModality,
        contractType: entity.contractType,
        workSchedule: entity.workSchedule ?? "",
        seniorityLevel: entity.seniorityLevel,
        salary: moneyToForm(entity.salary),
        salaryMax: moneyToForm(entity.salaryMax),
        expectedCompletionDate: entity.expectedCompletionDate?.slice(0, 10) ?? "",
        targetBoards: entity.targetBoards ?? [],
        slug: entity.slug ?? "",
        isPublic: Boolean(entity.isPublic),
    };
}

export const emptyJobVacancyForm = (): JobVacancyCreateDto => ({
    jobPositionId: null,
    jobTitle: "",
    positionsCount: 1,
    description: "",
    activities: "",
    assignments: "",
    requirements: "",
    benefits: "",
    department: "",
    location: "",
    workSchedule: "",
    salary: "",
    salaryMax: "",
    expectedCompletionDate: "",
    targetBoards: [],
    slug: "",
    isPublic: false,
});

export function jobVacancyFormToPayload(form: JobVacancyCreateDto): JobVacancyCreateDto {
    const isPublic = Boolean(form.isPublic);
    const slug =
        slugFromJobTitle(form.slug ?? "") ||
        (isPublic ? slugFromJobTitle(form.jobTitle) : "") ||
        undefined;
    return {
        ...form,
        jobPositionId: form.jobPositionId?.trim() || null,
        jobTitle: form.jobTitle.trim(),
        description: form.description?.trim() || undefined,
        activities: form.activities?.trim() || undefined,
        assignments: form.assignments?.trim() || undefined,
        requirements: form.requirements?.trim() || undefined,
        benefits: form.benefits?.trim() || undefined,
        department: form.department?.trim() || undefined,
        location: form.location?.trim() || undefined,
        workSchedule: form.workSchedule?.trim() || undefined,
        salary: moneyToPayload(form.salary),
        salaryMax: moneyToPayload(form.salaryMax),
        expectedCompletionDate: form.expectedCompletionDate?.trim() || undefined,
        targetBoards: form.targetBoards ?? [],
        slug,
        isPublic,
    };
}
