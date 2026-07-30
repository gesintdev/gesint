"use client";

import { useQuery } from "@tanstack/react-query";
import { Pencil } from "lucide-react";

import { JobVacancyProfileView } from "@/modules/rh/person/jobvacancy/components/JobVacancyProfileView";
import { JOB_VACANCY_CLIENT_MESSAGES } from "@/modules/rh/person/jobvacancy/exceptions/job-vacancy.messages";
import { jobVacancyKeys } from "@/modules/rh/person/jobvacancy/jobvacancy.query";
import { useJobVacancyAdmissionProcessStore } from "@/modules/rh/person/jobvacancy/lib/job-vacancy-admission-process.store";
import { jobVacancyService } from "@/modules/rh/person/jobvacancy/services/jobvacancy.service";
import {
    deriveWritePermission,
    useSessionPermissions,
} from "@/shared/auth/permissions";
import { canWriteRoute } from "@/shared/auth/route-access";
import { CRUD_TAB_LIST, useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { Button } from "@/shared/components/ui/Button";
import { ExceptionCapture } from "@/shared/exceptions";
import { findRouteById } from "@/shared/workspace/workspace-routes";
import { useWorkspaceTabOptional } from "@/shared/workspace/WorkspaceTabContext";

/** Painel Detalhamento (step interno da sub-aba da vaga). */
export function JobVacancyDetailTab() {
    const { startEdit, goToTab } = useCrudScreen();
    const permissions = useSessionPermissions();
    const wsTab = useWorkspaceTabOptional();
    const route = wsTab ? findRouteById(wsTab.tab.routeId) : undefined;
    const canEdit = canWriteRoute(
        route,
        permissions,
        deriveWritePermission(route?.permission),
    );

    const jobVacancyId = useJobVacancyAdmissionProcessStore((state) => state.jobVacancyId);

    const detailQuery = useQuery({
        queryKey: jobVacancyKeys.detail(jobVacancyId ?? ""),
        queryFn: () => jobVacancyService.getById(jobVacancyId!),
        enabled: Boolean(jobVacancyId),
    });

    const goToListing = () => {
        goToTab(CRUD_TAB_LIST);
    };
    if (!jobVacancyId) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-16 text-center">
                <p className="text-sm font-medium text-base-content/70">Detalhamento</p>
                <p className="max-w-md text-sm text-base-content/45">
                    Selecione uma vaga na listagem com duplo clique para ver o detalhamento.
                </p>
                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={goToListing}>
                    Ir para listagem
                </Button>
            </div>
        );
    }

    if (detailQuery.isLoading) {
        return (
            <div className="grid gap-2 p-5">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="skeleton-shimmer h-10 w-full" />
                ))}
            </div>
        );
    }

    if (detailQuery.isError || !detailQuery.data) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-16 text-center">
                <p className="text-sm font-medium text-error">
                    {ExceptionCapture.displayMessage(
                        detailQuery.error,
                        JOB_VACANCY_CLIENT_MESSAGES.JOB_VACANCY_LOAD_FAILED,
                    )}
                </p>
                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={goToListing}>
                    Ir para listagem
                </Button>
            </div>
        );
    }

    const vacancy = detailQuery.data;

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-auto">
            <div className="flex shrink-0 items-center justify-end gap-3 px-4 py-2">
                {canEdit ? (
                    <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        leftIcon={<Pencil className="size-3.5" strokeWidth={2.25} />}
                        onClick={() => startEdit(vacancy.id, vacancy)}
                    >
                        Editar
                    </Button>
                ) : null}
            </div>
            <div className="px-5 pb-5">
                <JobVacancyProfileView vacancy={vacancy} />
            </div>
        </div>
    );
}
