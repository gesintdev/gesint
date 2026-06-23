"use client";

import {useQuery} from "@tanstack/react-query";
import {lazy, Suspense, useMemo} from "react";

import {
    VacationEligibleCollaboratorsClient
} from "@/modules/rh/person/leave/components/VacationEligibleCollaboratorsClient";
import {LEAVE_VACATION_CRUD_LABELS} from "@/modules/rh/person/leave/config/leave-vacation.route-labels";
import {leaverequestKeys} from "@/modules/rh/person/leave/leave.query";
import {loadVacationEligibleCollaborators} from "@/modules/rh/person/leave/lib/vacation-eligible";
import type {CrudExtraTab} from "@/shared/components/crud/CrudScreen";
import {TabbedCrudPage} from "@/shared/components/layout/TabbedCrudPage";

const List = lazy(() =>
    import("@/modules/rh/person/leave/components/LeaveRequestRhListClient").then((m) => ({
        default: m.LeaveRequestRhListClient,
    })),
);
const Form = lazy(() =>
    import("@/modules/rh/person/leave/components/LeaveVacationRequestFormClient").then((m) => ({
        default: m.LeaveVacationRequestFormClient,
    })),
);

export function LeaveVacationWorkspacePage() {
    const eligibleQuery = useQuery({
        queryKey: [...leaverequestKeys.all, "vacation-eligible"],
        queryFn: loadVacationEligibleCollaborators,
    });

    const extraTabs: CrudExtraTab[] = useMemo(
        () => [
            {
                id: "eligible-vacation",
                label: LEAVE_VACATION_CRUD_LABELS.eligibleTabLabel,
                badge: eligibleQuery.data?.length ?? 0,
                publicAccess: 'full',
                content: <VacationEligibleCollaboratorsClient/>,
            },
        ],
        [eligibleQuery.data?.length],
    );

    return (
        <TabbedCrudPage
            routeId={LEAVE_VACATION_CRUD_LABELS.routeId}
            href={LEAVE_VACATION_CRUD_LABELS.href}
            routeLabel={LEAVE_VACATION_CRUD_LABELS.routeLabel}
            tabShortLabel={LEAVE_VACATION_CRUD_LABELS.tabShortLabel}
            listToolbar={LEAVE_VACATION_CRUD_LABELS.listToolbar}
            formTabLabel={LEAVE_VACATION_CRUD_LABELS.formTabLabel}
            listToFormLabel={LEAVE_VACATION_CRUD_LABELS.listToFormLabel}
            showListToFormButton
            list={
                <Suspense fallback={null}>
                    <List/>
                </Suspense>
            }
            form={
                <Suspense fallback={null}>
                    <Form/>
                </Suspense>
            }
            extraTabs={extraTabs}
        />
    );
}
