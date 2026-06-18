"use client";

import { CalendarPlus } from "lucide-react";

import { LEAVE_VACATION_CRUD_LABELS } from "@/modules/rh/person/leave/config/leave-vacation.route-labels";
import { VACATION_ELIGIBLE_TABLE_COLUMNS } from "@/modules/rh/person/leave/config/vacation-eligible.table-columns";
import { leaverequestKeys } from "@/modules/rh/person/leave/leave.query";
import type { VacationEligibleCollaborator } from "@/modules/rh/person/leave/lib/vacation-eligible";
import { loadVacationEligibleCollaborators } from "@/modules/rh/person/leave/lib/vacation-eligible";
import { CRUD_TAB_FORM, useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { Button } from "@/shared/components/ui/Button";

export function VacationEligibleCollaboratorsClient() {
    const { startCreate, goToTab } = useCrudScreen();

    const handleRequest = (row: VacationEligibleCollaborator) => {
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
        startCreate();
        goToTab(CRUD_TAB_FORM);
    };

    return (
        <QueryTablePanel<VacationEligibleCollaborator>
            queryKey={[...leaverequestKeys.all, "vacation-eligible"]}
            request={loadVacationEligibleCollaborators}
            columns={VACATION_ELIGIBLE_TABLE_COLUMNS}
            rowKey="collaboratorId"
            compact
            emptyMessage={LEAVE_VACATION_CRUD_LABELS.eligibleEmptyMessage}
            actionsClassName="w-px whitespace-nowrap"
            renderActions={(row) => (
                <Button
                    type="button"
                    size="sm"
                    variant="primary"
                    className="!h-7 !min-h-7 !px-2.5"
                    leftIcon={<CalendarPlus className="size-3.5" strokeWidth={2} />}
                    onClick={() => handleRequest(row)}
                >
                    Solicitar Férias
                </Button>
            )}
        />
    );
}
