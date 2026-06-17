import { JOBPOSITION_TABLE_COLUMNS } from "@/modules/dp/organization/jobposition/config/jobposition.table-columns";
import type { JobPosition, JobPositionCreateDto } from "@/modules/dp/organization/jobposition/dto/jobposition.dto";
import { BaseService } from "@/modules/root/services/base.service";
import type { SelectItem, SelectSearchResult } from "@/shared/components/ui/input/select-item.types";
import type { PageableResponseDto } from "@/shared/dto/pageable.dto";
import { apiFetch } from "@/shared/lib/api.client";
import type { EntityPickerAdvancedSearch, EntityPickerSearchParams } from "@/shared/types/entity-picker.types";

const AUTOCOMPLETE_PAGE_SIZE = 6;
const MODAL_PAGE_SIZE = 10;

export type JobPositionSearchParams = {
    page: number;
    size: number;
    title?: string;
    cboCode?: string;
    departmentId?: string;
};

class JobPositionService extends BaseService<JobPosition, JobPositionCreateDto, JobPositionCreateDto> {
    constructor() {
        super("/api/v1/job-positions");
    }
    search(params: JobPositionSearchParams): Promise<PageableResponseDto<JobPosition>> {
        const qs = new URLSearchParams();
        qs.set("page", String(params.page));
        qs.set("size", String(params.size));
        if (params.title?.trim()) qs.set("title", params.title.trim());
        if (params.cboCode?.trim()) qs.set("cboCode", params.cboCode.trim());
        if (params.departmentId?.trim()) qs.set("departmentId", params.departmentId.trim());
        return apiFetch<PageableResponseDto<JobPosition>>(`${this.basePath}/search?${qs}`);
    }
    async searchForAutocomplete(query: string, page = 0, departmentId?: string): Promise<SelectSearchResult> {
        const result = await this.search({
            page,
            size: AUTOCOMPLETE_PAGE_SIZE,
            title: query,
            departmentId,
        });
        return {
            items: result.content.map(toJobPositionSelectItem),
            page,
            hasMore: page + 1 < result.totalPages,
        };
    }
    searchForPicker(params: EntityPickerSearchParams): Promise<PageableResponseDto<JobPosition>> {
        return this.search({
            page: params.page,
            size: params.size,
            title: params.filters.title,
            cboCode: params.filters.cboCode,
        });
    }
}

export function toJobPositionSelectItem(jobPosition: JobPosition): SelectItem {
    return {
        value: jobPosition.id,
        label: jobPosition.title,
        description: jobPosition.cboCode ?? undefined,
    };
}

export const jobpositionService = new JobPositionService();
export const JOB_POSITION_PICKER_ADVANCED: EntityPickerAdvancedSearch<JobPosition> = {
    title: "Buscar cargo",
    filters: [
        { id: "title", label: "Título", placeholder: "Ex.: Analista de RH" },
        { id: "cboCode", label: "CBO", placeholder: "Ex.: 2524-05" },
    ],
    columns: JOBPOSITION_TABLE_COLUMNS,
    search: (params) => jobpositionService.searchForPicker(params),
    toSelectItem: toJobPositionSelectItem,
    pageSize: MODAL_PAGE_SIZE,
    emptyMessage: "Nenhum cargo encontrado.",
};
