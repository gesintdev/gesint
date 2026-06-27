"use client";

import { LEAVE_HISTORY_TABLE_COLUMNS } from "@/modules/rh/person/leave/config/leave-history.table-columns";
import { leaverequestKeys } from "@/modules/rh/person/leave/leave.query";
import {
    isRhVacationListing,
    type RhVacationRow,
    toRhVacationRow,
} from "@/modules/rh/person/leave/lib/leave-request.filters";
import { leaverequestService } from "@/modules/rh/person/leave/services/leave-request.service";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";

export function LeaveRequestRhListClient() {
    return (
        <QueryTablePanel<RhVacationRow>
            queryKey={[...leaverequestKeys.all, "rh-vacation"]}
            request={async () => {
                const rows = await leaverequestService.getAll();
                return rows.filter(isRhVacationListing).map(toRhVacationRow);
            }}
            columns={LEAVE_HISTORY_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhuma solicitação ou registro de férias."
        />
    );
}
