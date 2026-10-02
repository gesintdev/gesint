"use client";

import {Search} from "lucide-react";
import {useEffect, useMemo, useState} from "react";

import {auditTrailKeys} from "@/modules/cfg/settings/audittrail/audittrail.query";
import {AUDIT_TRAIL_TABLE_COLUMNS} from "@/modules/cfg/settings/audittrail/config/audit-trail.table-columns";
import type {
    AuditCategory,
    AuditTrailEntry,
    AuditTrailPeriod,
    AuditTrailRow,
} from "@/modules/cfg/settings/audittrail/dto/audit-trail.dto";
import {
    AUDIT_CATEGORY_ITEMS,
    AUDIT_PERIOD_ITEMS,
} from "@/modules/cfg/settings/audittrail/lib/audit-trail.options";
import {auditTrailService} from "@/modules/cfg/settings/audittrail/services/audit-trail.service";
import {QueryPagedTablePanel} from "@/shared/components/data/DataPanel";
import {WorkspacePage} from "@/shared/components/layout/WorkspacePage";
import {InputSelect, InputString} from "@/shared/components/ui/input/index";

const SEARCH_DEBOUNCE_MS = 400;

function toRow(entry: AuditTrailEntry): AuditTrailRow {
    return {...entry, actorLabel: entry.username ?? "—"};
}

/**
 * Trilha de auditoria (RN-05): registro imutável, somente consulta.
 * Visível apenas para GLOBAL_ADMIN e perfis com `audit:read` (Auditor).
 */
export function AuditTrailPage() {
    const [period, setPeriod] = useState<AuditTrailPeriod>("30D");
    const [category, setCategory] = useState<AuditCategory | "">("");
    const [searchInput, setSearchInput] = useState("");
    const [search, setSearch] = useState("");

    useEffect(() => {
        const timer = window.setTimeout(() => setSearch(searchInput.trim()), SEARCH_DEBOUNCE_MS);
        return () => window.clearTimeout(timer);
    }, [searchInput]);

    const baseFilters = useMemo(() => {
        const next: Record<string, string[]> = {period: [period]};
        if (category) next.category = [category];
        if (search) next.search = [search];
        return next;
    }, [period, category, search]);

    return (
        <WorkspacePage>
            <div className="grid min-h-0 flex-1 grid-rows-[auto_1fr] gap-2">
                <div className="grid grid-cols-1 gap-3 px-2 pt-3 sm:grid-cols-3">
                    <InputSelect
                        label="Período"
                        items={AUDIT_PERIOD_ITEMS}
                        value={period}
                        onValueChange={(v) => setPeriod((v || "30D") as AuditTrailPeriod)}
                    />
                    <InputSelect
                        label="Categoria"
                        items={AUDIT_CATEGORY_ITEMS}
                        value={category}
                        onValueChange={(v) => setCategory(v as AuditCategory | "")}
                        placeholder="Todas"
                        clearable
                    />
                    <InputString
                        label="Usuário ou registro"
                        value={searchInput}
                        onValueChange={setSearchInput}
                        placeholder="Buscar…"
                        maxLength={100}
                        leftIcon={<Search className="size-4"/>}
                    />
                </div>
                <QueryPagedTablePanel<AuditTrailRow>
                    queryKey={auditTrailKeys.all}
                    baseFilters={baseFilters}
                    paginationMode="load-more"
                    request={async (page, size) => {
                        const result = await auditTrailService.search(page, size, {
                            period,
                            category: category || undefined,
                            search,
                        });
                        return {...result, content: result.content.map(toRow)};
                    }}
                    columns={AUDIT_TRAIL_TABLE_COLUMNS}
                    rowKey="id"
                    emptyMessage="Nenhum evento registrado no período."
                />
            </div>
        </WorkspacePage>
    );
}

export default AuditTrailPage;
