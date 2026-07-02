import type { JobPosition, JobPositionCreateDto } from "@/modules/dp/organization/jobposition/dto/jobposition.dto";

export function jobpositionToFormDto(entity: JobPosition): JobPositionCreateDto {
    return {
        title: entity.title ?? "",
        cboCode: entity.cboCode ?? "",
        departmentId: entity.departmentId ?? "",
        nature: entity.nature ?? undefined,
    };
}

export const emptyJobPositionForm = (): JobPositionCreateDto => ({
    title: "",
    cboCode: "",
    departmentId: "",
    nature: undefined,
});
