import type { SelectItem, SelectSearchResult } from "@/shared/components/ui/input/select-item.types";
import type { PageableResponseDto } from "@/shared/dto/pageable.dto";
import { apiFetch } from "@/shared/lib/api.client";

const PAGE_SIZE = 6;

export type LocationOption = {
    id: string;
    name: string;
    code?: string;
    ibgeCode: number;
    stateId?: string;
    stateCode?: string;
};

export type PostalCodeAddress = {
    zipCode: string;
    street?: string;
    complement?: string;
    district?: string;
    cityId: string;
    cityName: string;
    cityIbgeCode: number;
    stateId: string;
    stateCode: string;
    stateName: string;
};

class AddressService {
    private readonly basePath = "/api/v1/addresses";

    findByPostalCode(postalCode: string): Promise<PostalCodeAddress> {
        return apiFetch<PostalCodeAddress>(`${this.basePath}/postal-code/${postalCode}`);
    }

    async searchStates(query: string, page = 0): Promise<SelectSearchResult> {
        const params = new URLSearchParams({ query, page: String(page), size: String(PAGE_SIZE) });
        const result = await apiFetch<PageableResponseDto<LocationOption>>(`${this.basePath}/states?${params}`);
        return this.toSearchResult(result, page, (item) => ({
            value: item.id,
            label: item.code ?? item.name,
            description: item.name,
        }));
    }

    async searchCities(stateId: string, query: string, page = 0): Promise<SelectSearchResult> {
        if (!stateId) return { items: [], page, hasMore: false };
        const params = new URLSearchParams({ stateId, query, page: String(page), size: String(PAGE_SIZE) });
        const result = await apiFetch<PageableResponseDto<LocationOption>>(`${this.basePath}/cities?${params}`);
        return this.toSearchResult(result, page, (item) => ({ value: item.id, label: item.name }));
    }

    private toSearchResult(
        result: PageableResponseDto<LocationOption>,
        page: number,
        mapItem: (_item: LocationOption) => SelectItem,
    ): SelectSearchResult {
        return {
            items: result.content.map(mapItem),
            page,
            hasMore: page + 1 < result.totalPages,
        };
    }
}

export const addressService = new AddressService();
