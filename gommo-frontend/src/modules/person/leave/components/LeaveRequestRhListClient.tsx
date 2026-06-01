"use client";

import { LEAVE_HISTORY_TABLE_COLUMNS } from "@/modules/person/leave/config/leave-history.table-columns";
import type { LeaveRequest } from "@/modules/person/leave/dto/leave-request.dto";
import { isVacationHistory } from "@/modules/person/leave/lib/leave-request.filters";
import { leaverequestKeys } from "@/modules/person/leave/leave.query";
import { leaverequestService } from "@/modules/person/leave/services/leave-request.service";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";

export function LeaveRequestRhListClient() {
    return (
        <QueryTablePanel<LeaveRequest>
            queryKey={[...leaverequestKeys.all, "rh-history"]}
            request={async () => {
                const rows = await leaverequestService.getAll();
                return rows.filter(isVacationHistory);
            }}
            columns={LEAVE_HISTORY_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhuma férias registrada no histórico."
        />
    );
}
