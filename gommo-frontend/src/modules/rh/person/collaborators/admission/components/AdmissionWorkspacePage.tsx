"use client";

import { useQuery } from "@tanstack/react-query";
import { lazy, Suspense, useMemo } from "react";

import { admissionprocessKeys } from "@/modules/rh/person/collaborators/admission/admission.query";
import { admissionprocessService } from "@/modules/rh/person/collaborators/admission/services/admission-process.service";
import { leaverequestKeys } from "@/modules/rh/person/leave/leave.query";
import { isAbsenceLeave, isVacationHistory } from "@/modules/rh/person/leave/lib/leave-request.filters";
import { leaverequestService } from "@/modules/rh/person/leave/services/leave-request.service";
import {
    type CrudExtraTab,
    useCrudExtraTabs,
    useCrudScreen,
} from "@/shared/components/crud/CrudScreen";
import { TabbedCrudPage } from "@/shared/components/layout/TabbedCrudPage";

const List = lazy(() =>
    import("@/modules/rh/person/collaborators/admission/components/AdmissionProcessListClient").then((m) => ({
        default: m.AdmissionProcessListClient,
    })),
);
const Form = lazy(() =>
    import("@/modules/rh/person/collaborators/admission/components/AdmissionProcessFormClient").then((m) => ({
        default: m.AdmissionProcessFormClient,
    })),
);
const VacationHistory = lazy(() =>
    import("@/modules/rh/person/collaborators/admission/components/AdmissionVacationHistoryTab").then((m) => ({
        default: m.AdmissionVacationHistoryTab,
    })),
);
const AbsenceHistory = lazy(() =>
    import("@/modules/rh/person/collaborators/admission/components/AdmissionAbsenceHistoryTab").then((m) => ({
        default: m.AdmissionAbsenceHistoryTab,
    })),
);

function AdmissionHistoryExtraTabsController() {
    const { editingId } = useCrudScreen();

    const admissionQuery = useQuery({
        queryKey: admissionprocessKeys.detail(editingId ?? ""),
        queryFn: () => admissionprocessService.getById(editingId!),
        enabled: Boolean(editingId),
    });
    const collaboratorId = admissionQuery.data?.collaboratorId;

    const historyPresenceQuery = useQuery({
        queryKey: [...leaverequestKeys.all, "admission-history-presence", collaboratorId ?? ""],
        queryFn: async () => {
            const rows = await leaverequestService.getAll();
            const forCollaborator = rows.filter((row) => row.collaboratorId === collaboratorId);
            return {
                hasVacationHistory: forCollaborator.some(isVacationHistory),
                hasAbsenceHistory: forCollaborator.some(isAbsenceLeave),
            };
        },
        enabled: Boolean(collaboratorId),
    });

    const extraTabs = useMemo((): CrudExtraTab[] => {
        if (!editingId || !collaboratorId) return [];
        const presence = historyPresenceQuery.data;
        if (!presence) return [];

        const tabs: CrudExtraTab[] = [];
        if (presence.hasVacationHistory) {
            tabs.push({
                id: "vacation-history",
                label: "Histórico de férias",
                permission: "leave:read",
                content: (
                    <Suspense fallback={null}>
                        <VacationHistory />
                    </Suspense>
                ),
            });
        }
        if (presence.hasAbsenceHistory) {
            tabs.push({
                id: "absence-history",
                label: "Histórico de afastamento",
                permission: "leave:read",
                content: (
                    <Suspense fallback={null}>
                        <AbsenceHistory />
                    </Suspense>
                ),
            });
        }
        return tabs;
    }, [collaboratorId, editingId, historyPresenceQuery.data]);

    useCrudExtraTabs(extraTabs);
    return null;
}

export function AdmissionWorkspacePage() {
    return (
        <TabbedCrudPage
            routeId="collaborator-admission"
            href="/collaborator/admission"
            routeLabel="Admissão"
            tabShortLabel="Adm"
            fieldTabName="fullName"
            list={
                <Suspense fallback={null}>
                    <List />
                </Suspense>
            }
            form={
                <Suspense fallback={null}>
                    <Form />
                </Suspense>
            }
            extraTabsController={<AdmissionHistoryExtraTabsController />}
        />
    );
}
