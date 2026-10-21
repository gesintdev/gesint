import type { GlobalSearchResponse } from "@/modules/root/search/dto/global-search.dto";
import { apiFetch } from "@/shared/lib/api.client";

const BASE_PATH = "/api/v1/search";

export const globalSearchService = {
    search(query: string, limitPerType = 5, signal?: AbortSignal): Promise<GlobalSearchResponse> {
        const params = new URLSearchParams({
            q: query,
            limitPerType: String(limitPerType),
        });
        return apiFetch<GlobalSearchResponse>(`${BASE_PATH}?${params}`, { signal });
    },
};
