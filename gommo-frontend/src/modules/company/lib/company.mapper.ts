import type { Company, CompanyCreateDto } from "@/modules/company/dto/company.dto";
import { digitsOnly } from "@/shared/lib/input/digits";

export function companyToFormDto(entity: Company): CompanyCreateDto {
    return {
        legalName: entity.legalName ?? "",
        tradeName: entity.tradeName ?? "",
        cnpj: digitsOnly(entity.cnpj ?? ""),
        email: entity.email ?? "",
        phone: entity.phone ?? "",
        city: entity.city ?? "",
    };
}

export const emptyCompanyForm = (): CompanyCreateDto => ({
    legalName: "",
    tradeName: "",
    cnpj: "",
    email: "",
    phone: "",
    city: "",
});
