"use client";

import { Eye } from "lucide-react";
import { useState } from "react";

import { VacationHistoryDetailModal } from "@/modules/rh/person/leave/components/VacationHistoryDetailModal";
import { LEAVE_HISTORY_TABLE_COLUMNS } from "@/modules/rh/person/leave/config/leave-history.table-columns";
import { leaverequestKeys } from "@/modules/rh/person/leave/leave.query";
import {
    enrichVacationHistoryRows,
    type VacationHistoryRow,
} from "@/modules/rh/person/leave/lib/leave-history.enrich";
import { isRhVacationListing } from "@/modules/rh/person/leave/lib/leave-request.filters";
import { leaverequestService } from "@/modules/rh/person/leave/services/leave-request.service";
import { TableActionButton } from "@/shared/components/crud/TableActionButton";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";

export function LeaveRequestRhListClient() {
    const [selected, setSelected] = useState<VacationHistoryRow | null>(null);

    return (
        <>
            <QueryTablePanel<VacationHistoryRow>
                queryKey={[...leaverequestKeys.all, "rh-vacation"]}
                request={async () => {
                    const rows = await leaverequestService.getAll();
                    return enrichVacationHistoryRows(rows.filter(isRhVacationListing));
                }}
                columns={LEAVE_HISTORY_TABLE_COLUMNS}
                rowKey="id"
                emptyMessage="Nenhuma solicitação ou registro de férias."
                rowActivateOn="doubleclick"
                onRowActivate={setSelected}
                renderActions={(row) => (
                    <TableActionButton
                        actionVariant="open"
                        aria-label="Visualizar detalhes"
                        title="Visualizar detalhes"
                        leftIcon={<Eye className="size-3.5" />}
                        onClick={(event) => {
                            event.stopPropagation();
                            setSelected(row);
                        }}
                    />
                )}
            />
            <VacationHistoryDetailModal
                row={selected}
                open={Boolean(selected)}
                onClose={() => setSelected(null)}
            />
        </>
    );
}
