"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { ArrowLeftRight, RefreshCw } from "lucide-react";
import { useCallback, useMemo, useState } from "react";
import { toast } from "sonner";

import { admissionProcessKanbanColumnKeys } from "@/modules/cfg/settings/admissionprocesskanban/admission-process-kanban-column.query";
import { admissionProcessKanbanColumnService } from "@/modules/cfg/settings/admissionprocesskanban/services/admission-process-kanban-column.service";
import { JobVacancyApplicationKanbanDetailModal } from "@/modules/rh/person/jobvacancy/components/JobVacancyApplicationKanbanDetailModal";
import {
    createAdmissionFromKanbanCard,
    HIRING_KANBAN_COLUMN_KEY,
} from "@/modules/rh/person/jobvacancy/lib/create-admission-from-kanban-card";
import { useJobVacancyAdmissionProcessStore } from "@/modules/rh/person/jobvacancy/lib/job-vacancy-admission-process.store";
import type { JobVacancyApplication } from "@/modules/rh/person/jobvacancyapplication/dto/job-vacancy-application.dto";
import { jobVacancyApplicationKeys } from "@/modules/rh/person/jobvacancyapplication/job-vacancy-application.query";
import { jobVacancyApplicationService } from "@/modules/rh/person/jobvacancyapplication/services/job-vacancy-application.service";
import { CRUD_TAB_LIST, useCrudScreen } from "@/shared/components/crud/CrudScreen";
import {
    KanbanBoard,
    type KanbanColumn,
    type KanbanItem,
    type KanbanItemMoveEvent,
} from "@/shared/components/kanban";
import { Button } from "@/shared/components/ui/Button";
import { ExceptionCapture } from "@/shared/exceptions";

type AdmissionKanbanCard = KanbanItem & {
    applicationId: string;
    candidateId: string;
};

export function JobVacancyAdmissionProcessTab() {
    const { goToTab } = useCrudScreen();
    const queryClient = useQueryClient();
    const jobVacancyId = useJobVacancyAdmissionProcessStore((state) => state.jobVacancyId);
    const jobVacancyTitle = useJobVacancyAdmissionProcessStore((state) => state.jobVacancyTitle);
    const [pendingItemIds, setPendingItemIds] = useState<Set<string>>(() => new Set());
    const [detailApplicationId, setDetailApplicationId] = useState<string | null>(null);

    const columnsQuery = useQuery({
        queryKey: admissionProcessKanbanColumnKeys.all,
        queryFn: () => admissionProcessKanbanColumnService.getAll(),
    });

    const applicationsQuery = useQuery({
        queryKey: jobVacancyApplicationKeys.byVacancy(jobVacancyId ?? ""),
        queryFn: () => jobVacancyApplicationService.getByVacancy(jobVacancyId!),
        enabled: Boolean(jobVacancyId),
    });

    const sortedColumns = useMemo(() => {
        const rows = (columnsQuery.data ?? []).filter((row) => row.status !== "DELETED");
        return [...rows].sort(
            (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.name.localeCompare(b.name),
        );
    }, [columnsQuery.data]);

    const detailApplication = useMemo(
        () => (applicationsQuery.data ?? []).find((row) => row.id === detailApplicationId) ?? null,
        [applicationsQuery.data, detailApplicationId],
    );

    const hireMutation = useMutation({
        mutationFn: (candidateId: string) =>
            createAdmissionFromKanbanCard({
                candidateId,
                jobVacancyId,
            }),
        onSuccess: () => {
            toast.success("Admissão criada a partir do candidato");
            setDetailApplicationId(null);
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, {
                fallbackMessage: "Não foi possível criar a admissão do candidato.",
            }),
    });

    const handleHiringDrop = useCallback((item?: AdmissionKanbanCard) => {
        if (!item?.applicationId) return;
        // Abre o detalhe para revisão; a criação da admissão é ação explícita no modal.
        setDetailApplicationId(item.applicationId);
    }, []);

    const boardColumns = useMemo((): KanbanColumn<AdmissionKanbanCard>[] => {
        const applications = (applicationsQuery.data ?? []).filter(
            (row) => row.status !== "DELETED" && Boolean(row.kanbanColumnKey?.trim()),
        );

        const cards: AdmissionKanbanCard[] = applications.map((row) => ({
            id: row.id,
            applicationId: row.id,
            candidateId: row.candidateId,
            title: row.candidateFullName ?? "Candidato",
            subtitle: row.candidateEmail ?? undefined,
        }));

        return sortedColumns.map((column) => {
            const isHiring = column.columnKey === HIRING_KANBAN_COLUMN_KEY;
            return {
                id: column.id,
                title: column.name,
                color: column.color,
                items: cards.filter((card) => {
                    const application = applications.find((row) => row.id === card.id);
                    return application?.kanbanColumnKey?.trim() === column.columnKey;
                }),
                onDrop: isHiring ? handleHiringDrop : undefined,
            };
        });
    }, [applicationsQuery.data, handleHiringDrop, sortedColumns]);

    const markPending = (itemId: string, pending: boolean) => {
        setPendingItemIds((current) => {
            const next = new Set(current);
            if (pending) next.add(itemId);
            else next.delete(itemId);
            return next;
        });
    };

    const moveMutation = useMutation({
        mutationFn: async (event: KanbanItemMoveEvent) => {
            const targetColumn = sortedColumns.find((column) => column.id === event.toColumnId);
            if (!targetColumn?.columnKey) {
                throw new Error("Coluna de destino inválida.");
            }
            return jobVacancyApplicationService.updateKanbanColumn(event.itemId, targetColumn.columnKey);
        },
        onMutate: async (event) => {
            markPending(event.itemId, true);
            if (!jobVacancyId) return { previous: undefined, itemId: event.itemId };

            const targetColumn = sortedColumns.find((column) => column.id === event.toColumnId);
            const nextKey = targetColumn?.columnKey?.trim();
            if (!nextKey) return { previous: undefined, itemId: event.itemId };

            const queryKey = jobVacancyApplicationKeys.byVacancy(jobVacancyId);
            await queryClient.cancelQueries({ queryKey });

            const previous = queryClient.getQueryData<JobVacancyApplication[]>(queryKey);
            queryClient.setQueryData<JobVacancyApplication[]>(queryKey, (current) => {
                if (!current) return current;
                return current.map((row) =>
                    row.id === event.itemId ? { ...row, kanbanColumnKey: nextKey } : row,
                );
            });

            return { previous, queryKey, itemId: event.itemId };
        },
        onError: (err, _event, context) => {
            if (context?.previous && context.queryKey) {
                queryClient.setQueryData(context.queryKey, context.previous);
            }
            ExceptionCapture.handle(err, {
                fallbackMessage: "Não foi possível mover o candidato no kanban.",
            });
        },
        onSettled: async (_data, _error, event, context) => {
            markPending(context?.itemId ?? event.itemId, false);
            if (!jobVacancyId) return;
            await queryClient.invalidateQueries({
                queryKey: jobVacancyApplicationKeys.byVacancy(jobVacancyId),
            });
            await queryClient.invalidateQueries({ queryKey: jobVacancyApplicationKeys.all });
        },
    });

    const handleSwitchVacancy = () => {
        goToTab(CRUD_TAB_LIST);
    };

    const isBoardRefreshing = columnsQuery.isFetching || applicationsQuery.isFetching;

    const handleRefreshBoard = () => {
        void columnsQuery.refetch();
        void applicationsQuery.refetch();
    };

    if (!jobVacancyId) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-16 text-center">
                <p className="text-sm font-medium text-base-content/70">Processo De Admissão</p>
                <p className="max-w-md text-sm text-base-content/45">
                    Selecione uma vaga na listagem e clique no botão de kanban para abrir o processo com os
                    candidatos.
                </p>
                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={handleSwitchVacancy}>
                    Ir para listagem
                </Button>
            </div>
        );
    }

    if (columnsQuery.isLoading || applicationsQuery.isLoading) {
        return (
            <div className="grid gap-2 p-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton-shimmer h-24 w-full" />
                ))}
            </div>
        );
    }

    if (columnsQuery.isError) {
        return (
            <div className="flex flex-1 items-center justify-center p-6">
                <p className="text-sm text-error">
                    {ExceptionCapture.displayMessage(
                        columnsQuery.error,
                        "Não foi possível carregar as colunas do processo.",
                    )}
                </p>
            </div>
        );
    }

    if (applicationsQuery.isError) {
        return (
            <div className="flex flex-1 items-center justify-center p-6">
                <p className="text-sm text-error">
                    {ExceptionCapture.displayMessage(
                        applicationsQuery.error,
                        "Não foi possível carregar os candidatos da vaga.",
                    )}
                </p>
            </div>
        );
    }

    if (sortedColumns.length === 0) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-16 text-center">
                <p className="text-sm font-medium text-base-content/70">Processo De Admissão</p>
                <p className="max-w-md text-sm text-base-content/45">
                    Nenhuma coluna configurada. Cadastre as etapas em Configurações &gt; Recursos Humanos &gt;
                    Processo de Admissão.
                </p>
            </div>
        );
    }

    return (
        <div className="flex min-h-[28rem] flex-1 flex-col overflow-hidden">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-base-content/8 px-4 py-2">
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-base-content">
                        {jobVacancyTitle ?? "Vaga selecionada"}
                    </p>
                    <p className="text-xs text-base-content/45">
                        {(applicationsQuery.data ?? []).filter((row) => row.kanbanColumnKey).length} candidato(s) no
                        quadro
                    </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                    <Button
                        type="button"
                        size="sm"
                        aria-label="Atualizar kanban"
                        className="gommo-btn--icon-only"
                        disabled={isBoardRefreshing}
                        onClick={handleRefreshBoard}
                        leftIcon={
                            <RefreshCw
                                className={clsx("size-3.5", isBoardRefreshing && "animate-spin")}
                                strokeWidth={2.25}
                            />
                        }
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        leftIcon={<ArrowLeftRight className="size-3.5" strokeWidth={2.25} />}
                        onClick={handleSwitchVacancy}
                    >
                        Trocar vaga
                    </Button>
                </div>
            </div>
            <KanbanBoard
                columns={boardColumns}
                pendingItemIds={pendingItemIds}
                onItemMove={(event) => moveMutation.mutate(event)}
                onCardDetailClick={(item) => setDetailApplicationId(item.applicationId)}
                emptyColumnLabel="Sem candidatos"
                className="min-h-0 flex-1"
            />
            <JobVacancyApplicationKanbanDetailModal
                open={Boolean(detailApplicationId)}
                application={detailApplication}
                columns={sortedColumns}
                onClose={() => setDetailApplicationId(null)}
                onCreateAdmission={
                    detailApplication?.candidateId
                        ? () => hireMutation.mutate(detailApplication.candidateId)
                        : undefined
                }
                createAdmissionLoading={hireMutation.isPending}
            />
        </div>
    );
}
