import type { JobPosition, JobPositionCreateDto } from "@/modules/dp/organization/jobposition/dto/jobposition.dto";

export function jobpositionToFormDto(entity: JobPosition): JobPositionCreateDto {
    return {
        title: entity.title ?? "",
        cboCode: entity.cboCode ?? "",
        departmentId: entity.departmentId ?? "",
        nature: entity.nature ?? undefined,
        companyId: entity.companyId ?? null,
        description: entity.description ?? "",
    };
}

export const emptyJobPositionForm = (defaultCompanyId?: string | null): JobPositionCreateDto => ({
    title: "",
    companyId: defaultCompanyId ?? null,
    cboCode: "",
    departmentId: "",
    nature: undefined,
    description: "",
});
