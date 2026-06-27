import { COMPANY_TABLE_COLUMNS } from "@/modules/dp/organization/company/config/company.table-columns";
import type { Company, CompanyCreateDto } from "@/modules/dp/organization/company/dto/company.dto";
import { BaseService } from "@/modules/root/services/base.service";
import type { SelectItem, SelectSearchResult } from "@/shared/components/ui/input/select-item.types";
import type { PageableResponseDto } from "@/shared/dto/pageable.dto";
import type { EntityPickerAdvancedSearch, EntityPickerSearchParams } from "@/shared/types/entity-picker.types";

const AUTOCOMPLETE_PAGE_SIZE = 6;
const MODAL_PAGE_SIZE = 10;

function filterCompanies(companies: Company[], filters: Record<string, string>): Company[] {
    const legalName = filters.legalName?.trim().toLowerCase();
    const cnpj = filters.cnpj?.replace(/\D/g, "");
    const city = filters.city?.trim().toLowerCase();
    return companies.filter((company) => {
        if (legalName && !company.legalName.toLowerCase().includes(legalName)) return false;
        if (cnpj && !company.cnpj.replace(/\D/g, "").includes(cnpj)) return false;
        if (city && !company.city?.toLowerCase().includes(city)) return false;
        return true;
    });
}

function paginate<T>(items: T[], page: number, size: number): PageableResponseDto<T> {
    const start = page * size;
    const content = items.slice(start, start + size);
    const totalElements = items.length;
    const totalPages = Math.max(1, Math.ceil(totalElements / size));
    return {
        content,
        page,
        size,
        totalElements,
        totalPages,
    };
}

export function toCompanySelectItem(company: Company): SelectItem {
    return {
        value: company.id,
        label: company.legalName,
        description: company.cnpj ?? undefined,
    };
}

class CompanyService extends BaseService<Company, CompanyCreateDto, CompanyCreateDto> {
    constructor() {
        super("/api/v1/companies");
    }
    async searchForAutocomplete(query: string, page = 0): Promise<SelectSearchResult> {
        const all = await this.getAll();
        const q = query.trim().toLowerCase();
        const filtered = q
            ? all.filter(
                  (company) =>
                      company.legalName.toLowerCase().includes(q) ||
                      company.tradeName?.toLowerCase().includes(q) ||
                      company.cnpj.replace(/\D/g, "").includes(q.replace(/\D/g, "")),
              )
            : all;
        const start = page * AUTOCOMPLETE_PAGE_SIZE;
        const slice = filtered.slice(start, start + AUTOCOMPLETE_PAGE_SIZE);
        const totalPages = Math.max(1, Math.ceil(filtered.length / AUTOCOMPLETE_PAGE_SIZE));
        return {
            items: slice.map(toCompanySelectItem),
            page,
            hasMore: page + 1 < totalPages,
        };
    }
    async searchForPicker(params: EntityPickerSearchParams): Promise<PageableResponseDto<Company>> {
        const all = await this.getAll();
        const filtered = filterCompanies(all, params.filters);
        return paginate(filtered, params.page, params.size);
    }
}

export const companyService = new CompanyService();
export const COMPANY_PICKER_ADVANCED: EntityPickerAdvancedSearch<Company> = {
    title: "Buscar empresa",
    filters: [
        { id: "legalName", label: "Razão social", placeholder: "Ex.: Gommo Ltda" },
        { id: "cnpj", label: "CNPJ", placeholder: "Somente números" },
        { id: "city", label: "Cidade", placeholder: "Ex.: São Paulo" },
    ],
    columns: COMPANY_TABLE_COLUMNS,
    search: (params) => companyService.searchForPicker(params),
    toSelectItem: toCompanySelectItem,
    pageSize: MODAL_PAGE_SIZE,
    emptyMessage: "Nenhuma empresa encontrada.",
};
