import type { Department, DepartmentCreateDto } from "@/modules/organization/department/dto/department.dto";
import { DEPARTMENT_TABLE_COLUMNS } from "@/modules/organization/department/config/department.table-columns";
import { BaseService } from "@/modules/root/services/base.service";
import { apiFetch } from "@/shared/lib/api.client";
import type { PageableResponseDto } from "@/shared/dto/pageable.dto";
import type { SelectItem, SelectSearchResult } from "@/shared/components/ui/input/select-item.types";
import type { EntityPickerAdvancedSearch, EntityPickerSearchParams } from "@/shared/types/entity-picker.types";

const AUTOCOMPLETE_PAGE_SIZE = 6;
const MODAL_PAGE_SIZE = 10;

export type DepartmentSearchParams = {
    page: number;
    size: number;
    name?: string;
    costCenter?: string;
};

class DepartmentService extends BaseService<Department, DepartmentCreateDto, DepartmentCreateDto> {
    constructor() {
        super("/api/v1/departments");
    }

    search(params: DepartmentSearchParams): Promise<PageableResponseDto<Department>> {
        const qs = new URLSearchParams();
        qs.set("page", String(params.page));
        qs.set("size", String(params.size));
        if (params.name?.trim()) qs.set("name", params.name.trim());
        if (params.costCenter?.trim()) qs.set("costCenter", params.costCenter.trim());
        return apiFetch<PageableResponseDto<Department>>(`${this.basePath}/search?${qs}`);
    }

    async searchForAutocomplete(query: string, page = 0): Promise<SelectSearchResult> {
        const result = await this.search({ page, size: AUTOCOMPLETE_PAGE_SIZE, name: query });
        return {
            items: result.content.map(toDepartmentSelectItem),
            page,
            hasMore: page + 1 < result.totalPages,
        };
    }

    searchForPicker(params: EntityPickerSearchParams): Promise<PageableResponseDto<Department>> {
        return this.search({
            page: params.page,
            size: params.size,
            name: params.filters.name,
            costCenter: params.filters.costCenter,
        });
    }
}

export function toDepartmentSelectItem(department: Department): SelectItem {
    return {
        value: department.id,
        label: department.name,
        description: department.costCenter ?? undefined,
    };
}

export const departmentService = new DepartmentService();

export const DEPARTMENT_PICKER_ADVANCED: EntityPickerAdvancedSearch<Department> = {
    title: "Buscar departamento",
    filters: [
        { id: "name", label: "Nome", placeholder: "Ex.: Recursos Humanos" },
        { id: "costCenter", label: "Centro de custo", placeholder: "Ex.: CC-001" },
    ],
    columns: DEPARTMENT_TABLE_COLUMNS,
    search: (params) => departmentService.searchForPicker(params),
    toSelectItem: toDepartmentSelectItem,
    pageSize: MODAL_PAGE_SIZE,
    emptyMessage: "Nenhum departamento encontrado.",
};
