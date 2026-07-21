import type { SelectItem, SelectSearchResult } from "@/shared/components/ui/input/select-item.types";
import type { PageableResponseDto } from "@/shared/dto/pageable.dto";
import { apiFetch } from "@/shared/lib/api.client";

const PAGE_SIZE = 6;

export type CboOccupationOption = {
    id: string;
    cboCode: string;
    name: string;
};

function toSelectItem(item: CboOccupationOption): SelectItem {
    return {
        value: item.cboCode,
        label: `${item.cboCode} — ${item.name}`,
        description: item.name,
    };
}

class CboOccupationService {
    private readonly basePath = "/api/v1/cbo-occupations";

    async search(query: string, page = 0): Promise<SelectSearchResult> {
        const params = new URLSearchParams({ query, page: String(page), size: String(PAGE_SIZE) });
        const result = await apiFetch<PageableResponseDto<CboOccupationOption>>(`${this.basePath}?${params}`);
        return {
            items: result.content.map(toSelectItem),
            page,
            hasMore: page + 1 < result.totalPages,
        };
    }

    async findByCode(cboCode: string): Promise<CboOccupationOption | null> {
        const normalized = cboCode.replace(/\D/g, "");
        if (normalized.length !== 6) return null;
        try {
            return await apiFetch<CboOccupationOption>(`${this.basePath}/by-code/${normalized}`);
        } catch {
            return null;
        }
    }

    formatLabel(option: Pick<CboOccupationOption, "cboCode" | "name">): string {
        return `${option.cboCode} — ${option.name}`;
    }
}

export const cboOccupationService = new CboOccupationService();
