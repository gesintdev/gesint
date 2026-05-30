import type { Department, DepartmentCreateDto } from "@/modules/organization/department/dto/department.dto";

export function departmentToFormDto(entity: Department): DepartmentCreateDto {
    return {
        name: entity.name ?? "",
        costCenter: entity.costCenter ?? "",
    };
}

export const emptyDepartmentForm = (): DepartmentCreateDto => ({
    name: "",
    costCenter: "",
});
