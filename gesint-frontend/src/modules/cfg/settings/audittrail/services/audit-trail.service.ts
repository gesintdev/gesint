import type {
    AuditTrailEntry,
    AuditTrailSearchParams,
} from "@/modules/cfg/settings/audittrail/dto/audit-trail.dto";
import {auditPeriodStart} from "@/modules/cfg/settings/audittrail/lib/audit-trail.options";
import type {PageableResponseDto} from "@/shared/dto/pageable.dto";
import {apiFetch} from "@/shared/lib/api.client";

const BASE_PATH = "/api/v1/audit-trail";

/** Trilha somente leitura: sem create/update/delete (registro imutável). */
export const auditTrailService = {
    search(page: number, size: number, params: AuditTrailSearchParams) {
        const query = new URLSearchParams({page: String(page), size: String(size)});
        const from = auditPeriodStart(params.period);
        if (from) query.set("from", from);
        if (params.category) query.set("category", params.category);
        const search = params.search?.trim();
        if (search) query.set("search", search);
        return apiFetch<PageableResponseDto<AuditTrailEntry>>(`${BASE_PATH}?${query.toString()}`);
    },
};
