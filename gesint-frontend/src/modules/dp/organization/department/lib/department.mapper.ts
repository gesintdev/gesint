import type {Department, DepartmentCreateDto} from "@/modules/dp/organization/department/dto/department.dto";

export function departmentToFormDto(entity: Department): DepartmentCreateDto {
    return {
        name: entity.name ?? "",
        costCenter: entity.costCenter ?? "",
        description: entity.description ?? "",
        monthlyBudget: entity.monthlyBudget ?? "",
        location: entity.location ?? "",
        phone: entity.phone ?? "",
        fax: entity.fax ?? "",
        phoneExtension: entity.phoneExtension ?? "",
        email: entity.email ?? "",
        responsibleCollaboratorIds: entity.responsibleCollaboratorIds ?? [],
        companyId: entity.companyId ?? null,
    };
}

export const emptyDepartmentForm = (defaultCompanyId?: string | null): DepartmentCreateDto => ({
    name: "",
    companyId: defaultCompanyId ?? null,
    costCenter: "",
    description: "",
    monthlyBudget: "",
    location: "",
    phone: "",
    fax: "",
    phoneExtension: "",
    email: "",
    responsibleCollaboratorIds: [],
});
