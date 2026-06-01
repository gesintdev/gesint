"use client";

import { LEAVE_PENDING_TABLE_COLUMNS } from "@/modules/person/leave/config/leave-pending.table-columns";
import type { LeaveRequest } from "@/modules/person/leave/dto/leave-request.dto";
import { isPendingVacationRequest } from "@/modules/person/leave/lib/leave-request.filters";
import { leaverequestKeys } from "@/modules/person/leave/leave.query";
import { leaverequestService } from "@/modules/person/leave/services/leave-request.service";
import { CRUD_TAB_FORM, useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { Button } from "@/shared/components/ui/Button";

export function LeavePendingRequestsClient() {
    const { startEdit, goToTab } = useCrudScreen();

    const handleRegister = (row: LeaveRequest) => {
        startEdit(row.id, row);
        goToTab(CRUD_TAB_FORM);
    };

    return (
        <QueryTablePanel<LeaveRequest>
            queryKey={[...leaverequestKeys.all, "pending-vacation"]}
            request={async () => {
                const rows = await leaverequestService.getAll();
                return rows.filter(isPendingVacationRequest);
            }}
            columns={LEAVE_PENDING_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhuma solicitação de férias pendente."
            renderActions={(row) => (
                <Button type="button" size="sm" variant="primary" onClick={() => handleRegister(row)}>
                    Cadastrar
                </Button>
            )}
        />
    );
}
