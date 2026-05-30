import type { EmploymentContract, EmploymentContractCreateDto } from "@/modules/person/contract/dto/employment-contract.dto";

export function employmentcontractToFormDto(entity: EmploymentContract): EmploymentContractCreateDto {
    return {
        collaboratorId: entity.collaboratorId ?? "",
        contractType: entity.contractType,
        startDate: entity.startDate?.slice(0, 10) ?? "",
        endDate: entity.endDate?.slice(0, 10) ?? "",
        baseSalary: entity.baseSalary != null ? String(entity.baseSalary) : "",
    };
}

export const emptyEmploymentContractForm = (): EmploymentContractCreateDto => ({
    collaboratorId: "",
    startDate: "",
    baseSalary: "",
});
