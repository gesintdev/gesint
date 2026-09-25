import type {
    JobPositionCompetency,
    JobPositionCompetencyCreateDto,
} from "@/modules/dp/organization/jobposition/competency/dto/job-position-competency.dto";

export function emptyJobPositionCompetencyForm(jobPositionId = ""): JobPositionCompetencyCreateDto {
    return {
        jobPositionId,
        competencyId: "",
        competencyName: "",
        expectedLevel: "LEVEL_2",
        usedIn: ["SELECTION", "EXPERIENCE", "PERFORMANCE"],
        validFrom: new Date().toISOString().slice(0, 10),
        validUntil: "",
    };
}

export function jobPositionCompetencyToFormDto(entity: JobPositionCompetency): JobPositionCompetencyCreateDto {
    return {
        jobPositionId: entity.jobPositionId,
        competencyId: entity.competencyId,
        competencyName: entity.competencyName ?? "",
        expectedLevel: entity.expectedLevel,
        usedIn: [...(entity.usedIn ?? [])],
        validFrom: entity.validFrom,
        validUntil: entity.validUntil ?? "",
    };
}

export function jobPositionCompetencyToApiPayload(form: JobPositionCompetencyCreateDto) {
    return {
        jobPositionId: form.jobPositionId,
        competencyId: form.competencyId,
        expectedLevel: form.expectedLevel,
        usedIn: form.usedIn ?? [],
        validFrom: form.validFrom,
        validUntil: form.validUntil?.trim() || undefined,
    };
}
