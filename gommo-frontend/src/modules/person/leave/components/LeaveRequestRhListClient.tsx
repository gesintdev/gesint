"use client";
import { LEAVE_HISTORY_TABLE_COLUMNS } from "@/modules/person/leave/config/leave-history.table-columns";
import type { LeaveRequest } from "@/modules/person/leave/dto/leave-request.dto";
import { isRhVacationListing } from "@/modules/person/leave/lib/leave-request.filters";
import { leaverequestKeys } from "@/modules/person/leave/leave.query";
import { leaverequestService } from "@/modules/person/leave/services/leave-request.service";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";

type RhVacationRow = LeaveRequest & {
    rhVacationStatus: "PENDING" | "APPROVED" | "RETURNED" | "REJECTED";
};

function mapRhVacationStatus(row: LeaveRequest): RhVacationRow["rhVacationStatus"] {
    if (row.approved === true || row.reviewStatus === "APPROVED") return "APPROVED";
    if (row.reviewStatus === "RETURNED") return "RETURNED";
    if (row.reviewStatus === "REJECTED") return "REJECTED";
    return "PENDING";
}

export function LeaveRequestRhListClient() {
    return (
        <QueryTablePanel<RhVacationRow>
            queryKey={[...leaverequestKeys.all, "rh-vacation"]}
            request={async () => {
                const rows = await leaverequestService.getAll();
                return rows.filter(isRhVacationListing).map((row) => ({
                    ...row,
                    rhVacationStatus: mapRhVacationStatus(row),
                }));
            }}
            columns={LEAVE_HISTORY_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhuma solicitação ou registro de férias."
        />
    );
}
