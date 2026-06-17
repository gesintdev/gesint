"use client";

import { LEAVE_VACATION_CRUD_LABELS } from "@/modules/person/leave/config/leave-vacation.route-labels";
import { VACATION_ELIGIBLE_TABLE_COLUMNS } from "@/modules/person/leave/config/vacation-eligible.table-columns";
import type { VacationEligibleCollaborator } from "@/modules/person/leave/lib/vacation-eligible";
import { loadVacationEligibleCollaborators } from "@/modules/person/leave/lib/vacation-eligible";
import { leaverequestKeys } from "@/modules/person/leave/leave.query";
import { CRUD_TAB_FORM, useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { Button } from "@/shared/components/ui/Button";

export function VacationEligibleCollaboratorsClient() {
    const { startCreate, goToTab } = useCrudScreen();

    const handleRequest = (row: VacationEligibleCollaborator) => {
        startCreate();
        goToTab(CRUD_TAB_FORM);
        if (typeof window !== "undefined") {
            window.sessionStorage.setItem(
                "gommo-vacation-request-prefill",
                JSON.stringify({
                    collaboratorId: row.collaboratorId,
                    unjustifiedAbsences: row.unjustifiedAbsences,
                    justifiedAbsences: row.justifiedAbsences,
                    acquisitionPeriodStart: row.acquisitionStart,
                    acquisitionPeriodEnd: row.acquisitionEnd,
                }),
            );
        }
    };

    return (
        <QueryTablePanel<VacationEligibleCollaborator>
            queryKey={[...leaverequestKeys.all, "vacation-eligible"]}
            request={loadVacationEligibleCollaborators}
            columns={VACATION_ELIGIBLE_TABLE_COLUMNS}
            rowKey="collaboratorId"
            emptyMessage={LEAVE_VACATION_CRUD_LABELS.eligibleEmptyMessage}
            renderActions={(row) => (
                <Button type="button" size="md" variant="primary" onClick={() => handleRequest(row)}>
                    Solicitar
                </Button>
            )}
        />
    );
}
