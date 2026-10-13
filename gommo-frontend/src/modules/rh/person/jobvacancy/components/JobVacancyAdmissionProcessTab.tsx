"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { ArrowLeftRight, RefreshCw } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { admissionProcessKanbanColumnKeys } from "@/modules/cfg/settings/admissionprocesskanban/admission-process-kanban-column.query";
import { admissionProcessKanbanColumnService } from "@/modules/cfg/settings/admissionprocesskanban/services/admission-process-kanban-column.service";
import {
    CandidateMatchScoreDetailModal,
    type CandidateMatchScoreDetailTarget,
} from "@/modules/rh/person/jobvacancy/components/CandidateMatchScoreDetailModal";
import { CandidateMatchScoreTag } from "@/modules/rh/person/jobvacancy/components/CandidateMatchScoreTag";
import { HireProposalModal } from "@/modules/rh/person/jobvacancy/components/HireProposalModal";
import { JobVacancyApplicationKanbanDetailModal } from "@/modules/rh/person/jobvacancy/components/JobVacancyApplicationKanbanDetailModal";
import { JobVacancyApplicationRejectModal } from "@/modules/rh/person/jobvacancy/components/JobVacancyApplicationRejectModal";
import {
    applicationAiScore,
    isApplicationAiPending,
} from "@/modules/rh/person/jobvacancy/lib/application-match-score";
import {
    CLOSED_KANBAN_COLUMN_KEY,
    REJECTION_FEEDBACK_LABELS,
    REJECTION_FEEDBACK_TONE,
} from "@/modules/rh/person/jobvacancy/lib/job-application-rejection";
import { jobVacancyKeys } from "@/modules/rh/person/jobvacancy/jobvacancy.query";
import { jobVacancyService } from "@/modules/rh/person/jobvacancy/services/jobvacancy.service";
import { useJobVacancyAdmissionProcessStore } from "@/modules/rh/person/jobvacancy/lib/job-vacancy-admission-process.store";
import type {
    JobVacancyApplication,
    JobVacancyApplicationRejectDto,
} from "@/modules/rh/person/jobvacancyapplication/dto/job-vacancy-application.dto";
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
import { formatPhone } from "@/shared/lib/table/format-cell-value";

type AdmissionKanbanCard = KanbanItem & {
    applicationId: string;
    candidateId: string;
    score: number;
    hasCurriculum?: boolean;
    hired?: boolean;
};

export function JobVacancyAdmissionProcessTab() {
    const { goToTab } = useCrudScreen();
    const queryClient = useQueryClient();
    const jobVacancyId = useJobVacancyAdmissionProcessStore((state) => state.jobVacancyId);
    const [pendingItemIds, setPendingItemIds] = useState<Set<string>>(() => new Set());
    const [detailApplicationId, setDetailApplicationId] = useState<string | null>(null);
    const [rejectApplicationId, setRejectApplicationId] = useState<string | null>(null);
    const [hireApplicationId, setHireApplicationId] = useState<string | null>(null);
    const [hireColumnKey, setHireColumnKey] = useState<string>("");
    const [scoreDetailTarget, setScoreDetailTarget] = useState<CandidateMatchScoreDetailTarget | null>(
        null,
    );
    const startedForVacancyRef = useRef<string | null>(null);

    const columnsQuery = useQuery({
        queryKey: admissionProcessKanbanColumnKeys.all,
        queryFn: () => admissionProcessKanbanColumnService.getAll(),
    });

    const vacancyQuery = useQuery({
        queryKey: jobVacancyKeys.detail(jobVacancyId ?? ""),
        queryFn: () => jobVacancyService.getById(jobVacancyId!),
        enabled: Boolean(jobVacancyId),
    });

    const closureRequirementOptions = useMemo(() => {
        const items = vacancyQuery.data?.requirementItems ?? [];
        if (items.length > 0) return items;
        const legacy = vacancyQuery.data?.requirements;
        if (!legacy?.trim()) return [];
        return legacy
            .split(/[\r\n;]+/)
            .map((line) => line.trim())
            .filter(Boolean);
    }, [vacancyQuery.data?.requirementItems, vacancyQuery.data?.requirements]);

    const applicationsQuery = useQuery({
        queryKey: jobVacancyApplicationKeys.byVacancy(jobVacancyId ?? ""),
        queryFn: () => jobVacancyApplicationService.getByVacancy(jobVacancyId!),
        enabled: Boolean(jobVacancyId),
        refetchInterval: (current) => {
            const rows = current.state.data ?? [];
            return rows.some((row) => isApplicationAiPending(row) || row.rejectionFeedbackStatus === "PENDING")
                ? 4000
                : false;
        },
    });

    const startProcessMutation = useMutation({
        mutationFn: (vacancyId: string) => jobVacancyApplicationService.startAdmissionProcess(vacancyId),
        onSuccess: async (_data, vacancyId) => {
            await queryClient.invalidateQueries({
                queryKey: jobVacancyApplicationKeys.byVacancy(vacancyId),
            });
            await queryClient.invalidateQueries({ queryKey: jobVacancyApplicationKeys.all });
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, {
                fallbackMessage: "Não foi possível posicionar os candidatos no kanban.",
            }),
    });

    useEffect(() => {
        startedForVacancyRef.current = null;
    }, [jobVacancyId]);

    useEffect(() => {
        if (!jobVacancyId || !applicationsQuery.isSuccess) return;
        if (startedForVacancyRef.current === jobVacancyId) return;
        if (startProcessMutation.isPending) return;

        const rows = (applicationsQuery.data ?? []).filter((row) => row.status !== "DELETED");
        if (rows.length === 0) {
            startedForVacancyRef.current = jobVacancyId;
            return;
        }

        const needsStart = rows.some((row) => !row.kanbanColumnKey?.trim());
        if (!needsStart) {
            startedForVacancyRef.current = jobVacancyId;
            return;
        }

        startedForVacancyRef.current = jobVacancyId;
        startProcessMutation.mutate(jobVacancyId, {
            onError: () => {
                if (startedForVacancyRef.current === jobVacancyId) {
                    startedForVacancyRef.current = null;
                }
            },
        });
        // mutate/isPending are stable enough; avoid depending on the whole mutation object.
        // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
    }, [applicationsQuery.data, applicationsQuery.isSuccess, jobVacancyId]);

    const sortedColumns = useMemo(() => {
        const rows = (columnsQuery.data ?? []).filter((row) => row.status !== "DELETED");
        return [...rows].sort(
            (a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0) || a.name.localeCompare(b.name),
        );
    }, [columnsQuery.data]);

    const hireColumn = useMemo(
        () => sortedColumns.find((column) => column.columnAction === "CREATE_ADMISSION") ?? null,
        [sortedColumns],
    );

    const detailApplication = useMemo(
        () => (applicationsQuery.data ?? []).find((row) => row.id === detailApplicationId) ?? null,
        [applicationsQuery.data, detailApplicationId],
    );

    const rejectApplication = useMemo(
        () => (applicationsQuery.data ?? []).find((row) => row.id === rejectApplicationId) ?? null,
        [applicationsQuery.data, rejectApplicationId],
    );

    const rejectMutation = useMutation({
        mutationFn: ({ id, dto }: { id: string; dto: JobVacancyApplicationRejectDto }) =>
            jobVacancyApplicationService.reject(id, dto),
        onMutate: ({ id }) => markPending(id, true),
        onSuccess: (updated) => {
            toast.success("Candidato encerrado");
            setRejectApplicationId(null);
            if (jobVacancyId) {
                queryClient.setQueryData<JobVacancyApplication[]>(
                    jobVacancyApplicationKeys.byVacancy(jobVacancyId),
                    (current) => current?.map((row) => (row.id === updated.id ? updated : row)),
                );
            }
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: "Não foi possível encerrar o candidato." }),
        onSettled: async (_data, _error, variables) => {
            markPending(variables.id, false);
            if (!jobVacancyId) return;
            await queryClient.invalidateQueries({
                queryKey: jobVacancyApplicationKeys.byVacancy(jobVacancyId),
            });
            await queryClient.invalidateQueries({ queryKey: jobVacancyApplicationKeys.all });
        },
    });

    const openHireProposal = useCallback(
        (applicationId: string, columnKey?: string) => {
            const key = columnKey?.trim() || hireColumn?.columnKey?.trim() || "";
            if (!key) {
                toast.error("Nenhuma coluna configurada com ação de proposta de contratação.");
                return;
            }
            setHireColumnKey(key);
            setHireApplicationId(applicationId);
        },
        [hireColumn?.columnKey],
    );

    const handleHireColumnDrop = useCallback((item?: AdmissionKanbanCard) => {
        if (!item?.applicationId) return;
        // Arrastar para Contratação abre o modal do candidato; a proposta sai de "Criar Admissão".
        setDetailApplicationId(item.applicationId);
    }, []);

    const openScoreDetail = useCallback((row: {
        applicationId: string;
        candidateId: string;
        candidateName?: string | null;
    }) => {
        setScoreDetailTarget({
            applicationId: row.applicationId,
            candidateId: row.candidateId,
            candidateName: row.candidateName ?? undefined,
        });
    }, []);

    const boardColumns = useMemo((): KanbanColumn<AdmissionKanbanCard>[] => {
        const applications = (applicationsQuery.data ?? []).filter(
            (row) => row.status !== "DELETED" && Boolean(row.kanbanColumnKey?.trim()),
        );

        const interviewColumnKeys = new Set(
            sortedColumns.filter((column) => column.interviewColumn).map((column) => column.columnKey),
        );

        const cards: AdmissionKanbanCard[] = applications
            .map((row) => {
                const score = applicationAiScore(row) ?? -1;
                const pending = isApplicationAiPending(row);
                const feedbackStatus = row.rejectionFeedbackStatus ?? null;
                const columnKey = row.kanbanColumnKey?.trim() ?? "";
                const hired =
                    row.applicationStatus === "HIRED" || Boolean(row.admissionProcessId);
                const averages =
                    columnKey && interviewColumnKeys.has(columnKey) ? (row.interviewAverages ?? []) : [];
                const averagesMeta =
                    averages.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                            {averages.slice(0, 3).map((average) => (
                                <span
                                    key={average.competencyId}
                                    className="rounded border border-base-content/10 bg-base-100 px-1.5 py-0.5 text-[0.625rem] text-base-content/65"
                                    title={`${average.competencyName ?? "Competência"}: média ${average.average}`}
                                >
                                    {(average.competencyName ?? "Comp.").slice(0, 12)}
                                    {average.competencyName && average.competencyName.length > 12 ? "…" : ""}{" "}
                                    · {average.average}
                                </span>
                            ))}
                            {averages.length > 3 ? (
                                <span className="text-[0.625rem] text-base-content/45">
                                    +{averages.length - 3}
                                </span>
                            ) : null}
                        </div>
                    ) : null;
                return {
                    id: row.id,
                    applicationId: row.id,
                    candidateId: row.candidateId,
                    title: row.candidateFullName ?? "Candidato",
                    subtitle: row.candidateEmail ?? undefined,
                    meta: hired ? (
                        row.admissionProcessId ? (
                            <a
                                className="font-medium text-success hover:underline"
                                href={`/collaborator/admission?edit=${encodeURIComponent(row.admissionProcessId)}`}
                                onClick={(event) => event.stopPropagation()}
                            >
                                Admissão criada
                            </a>
                        ) : (
                            <span className="font-medium text-success">Admissão criada</span>
                        )
                    ) : row.rejectionReason ? (
                        <div className="grid gap-0.5">
                            <span className="line-clamp-2 text-base-content/60" title={row.rejectionRequirement ?? undefined}>
                                {row.rejectionReasonLabel}
                            </span>
                            {feedbackStatus ? (
                                <span
                                    className={clsx("font-medium", REJECTION_FEEDBACK_TONE[feedbackStatus])}
                                    title={row.rejectionFeedbackDetail ?? undefined}
                                >
                                    {REJECTION_FEEDBACK_LABELS[feedbackStatus]}
                                </span>
                            ) : null}
                        </div>
                    ) : averagesMeta ? (
                        averagesMeta
                    ) : row.candidatePhone ? (
                        formatPhone(row.candidatePhone)
                    ) : undefined,
                    badge: (
                        <CandidateMatchScoreTag
                            score={score < 0 ? null : score}
                            pending={pending}
                            supportLabel
                            onClick={() =>
                                openScoreDetail({
                                    applicationId: row.id,
                                    candidateId: row.candidateId,
                                    candidateName: row.candidateFullName,
                                })
                            }
                        />
                    ),
                    score,
                    hasCurriculum: Boolean(row.aiAnalysis?.hasCurriculum),
                    hired,
                };
            })
            .sort((a, b) => {
                if (Boolean(a.hasCurriculum) !== Boolean(b.hasCurriculum)) {
                    return a.hasCurriculum ? -1 : 1;
                }
                return b.score - a.score;
            });

        return sortedColumns.map((column) => {
            const isHireColumn = column.columnAction === "CREATE_ADMISSION";
            return {
                id: column.id,
                title: column.name,
                color: column.color,
                items: cards.filter((card) => {
                    const application = applications.find((row) => row.id === card.id);
                    return application?.kanbanColumnKey?.trim() === column.columnKey;
                }),
                onDrop: isHireColumn ? handleHireColumnDrop : undefined,
            };
        });
    }, [applicationsQuery.data, handleHireColumnDrop, openScoreDetail, sortedColumns]);

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

    const handleItemMove = (event: KanbanItemMoveEvent) => {
        const targetColumn = sortedColumns.find((column) => column.id === event.toColumnId);
        if (targetColumn?.columnKey === CLOSED_KANBAN_COLUMN_KEY) {
            if (event.fromColumnId !== event.toColumnId) setRejectApplicationId(event.itemId);
            return;
        }
        moveMutation.mutate(event);
    };

    const handleSwitchVacancy = () => {
        goToTab(CRUD_TAB_LIST);
    };

    const handleHireSuccess = async () => {
        if (!jobVacancyId) return;
        await queryClient.invalidateQueries({
            queryKey: jobVacancyApplicationKeys.byVacancy(jobVacancyId),
        });
        await queryClient.invalidateQueries({ queryKey: jobVacancyApplicationKeys.all });
        setDetailApplicationId(null);
    };

    const isBoardRefreshing =
        columnsQuery.isFetching || applicationsQuery.isFetching || startProcessMutation.isPending;

    const handleRefreshBoard = () => {
        void columnsQuery.refetch();
        void applicationsQuery.refetch();
    };

    if (!jobVacancyId) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 py-16 text-center">
                <p className="text-sm font-medium text-base-content/70">Candidatos</p>
                <p className="max-w-md text-sm text-base-content/45">
                    Selecione uma vaga na listagem com duplo clique para movimentar os candidatos no kanban.
                </p>
                <Button type="button" variant="outline" size="sm" className="mt-2" onClick={handleSwitchVacancy}>
                    Ir para listagem
                </Button>
            </div>
        );
    }

    if (columnsQuery.isLoading || applicationsQuery.isLoading || startProcessMutation.isPending) {
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
                <p className="text-sm font-medium text-base-content/70">Candidatos</p>
                <p className="max-w-md text-sm text-base-content/45">
                    Nenhuma coluna configurada. Cadastre as etapas em Configurações &gt; Recursos Humanos &gt;
                    Processo de Admissão.
                </p>
            </div>
        );
    }

    return (
        <div className="flex h-full min-h-0 flex-1 flex-col overflow-hidden">
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-base-content/8 px-4 py-2">
                <div className="min-w-0">
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
                onItemMove={handleItemMove}
                onCardDetailClick={(item) => setDetailApplicationId(item.applicationId)}
                emptyColumnLabel="Sem candidatos"
                className="min-h-0 flex-1"
            />
            <JobVacancyApplicationKanbanDetailModal
                open={Boolean(detailApplicationId)}
                application={detailApplication}
                columns={sortedColumns}
                onClose={() => setDetailApplicationId(null)}
                onConfirmHire={
                    detailApplication &&
                    hireColumn &&
                    detailApplication.kanbanColumnKey?.trim() === hireColumn.columnKey &&
                    detailApplication.applicationStatus !== "HIRED" &&
                    !detailApplication.admissionProcessId
                        ? () => {
                              const applicationId = detailApplication.id;
                              const columnKey = hireColumn.columnKey;
                              setDetailApplicationId(null);
                              openHireProposal(applicationId, columnKey);
                          }
                        : undefined
                }
            />
            <HireProposalModal
                open={Boolean(hireApplicationId)}
                applicationId={hireApplicationId}
                columnKey={hireColumnKey}
                onClose={() => {
                    setHireApplicationId(null);
                    setHireColumnKey("");
                }}
                onSuccess={() => {
                    void handleHireSuccess();
                }}
            />
            <JobVacancyApplicationRejectModal
                open={Boolean(rejectApplicationId)}
                application={rejectApplication}
                requirementOptions={closureRequirementOptions}
                loading={rejectMutation.isPending}
                onCancel={() => setRejectApplicationId(null)}
                onConfirm={(dto) => {
                    if (rejectApplicationId) rejectMutation.mutate({ id: rejectApplicationId, dto });
                }}
            />
            <CandidateMatchScoreDetailModal
                open={Boolean(scoreDetailTarget)}
                jobVacancyId={jobVacancyId}
                target={scoreDetailTarget}
                onClose={() => setScoreDetailTarget(null)}
            />
        </div>
    );
}
