"use client";

import { useQuery } from "@tanstack/react-query";
import { lazy, Suspense, useMemo } from "react";

import { admissionprocessKeys } from "@/modules/rh/person/collaborators/admission/admission.query";
import { admissionprocessService } from "@/modules/rh/person/collaborators/admission/services/admission-process.service";
import { leaverequestKeys } from "@/modules/rh/person/leave/leave.query";
import { isAbsenceLeave, isVacationHistory } from "@/modules/rh/person/leave/lib/leave-request.filters";
import { leaverequestService } from "@/modules/rh/person/leave/services/leave-request.service";
import { SystemEnum } from "@/modules/root/enum/SystemEnum";
import {
    type CrudExtraTab,
    useCrudExtraTabs,
    useCrudScreen,
} from "@/shared/components/crud/CrudScreen";
import { TabbedCrudPage } from "@/shared/components/layout/TabbedCrudPage";
import { useActiveSystem } from "@/shared/context/ActiveSystemContext";
import { useBranchScopedDetailQuery } from "@/shared/hooks/useBranchScopedDetailQuery";

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
const Pipeline = lazy(() =>
    import("@/modules/rh/person/collaborators/admission/components/AdmissionPipelineTab").then((m) => ({
        default: m.AdmissionPipelineTab,
    })),
);

function AdmissionHistoryExtraTabsController() {
    const { editingId } = useCrudScreen();
    const { activeSystem } = useActiveSystem();

    const admissionQuery = useBranchScopedDetailQuery(
        admissionprocessKeys.detail(editingId ?? ""),
        () => admissionprocessService.getById(editingId!),
        {enabled: Boolean(editingId)},
    );
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
        const tabs: CrudExtraTab[] = [];

        // Acompanhamento e exclusivo do DP: no RH o menu de Admissao e o mesmo, mas a esteira nao.
        if (activeSystem === SystemEnum.DP) {
            tabs.push({
                id: "pipeline",
                label: "Acompanhamento",
                placement: "leading",
                initial: true,
                permission: "admission:pipeline",
                content: (
                    <Suspense fallback={null}>
                        <Pipeline />
                    </Suspense>
                ),
            });
        }

        if (!editingId || !collaboratorId) return tabs;
        const presence = historyPresenceQuery.data;
        if (!presence) return tabs;

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
    }, [activeSystem, collaboratorId, editingId, historyPresenceQuery.data]);

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
