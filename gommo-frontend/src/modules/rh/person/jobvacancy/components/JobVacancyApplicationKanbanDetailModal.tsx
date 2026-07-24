"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import clsx from "clsx";
import {ChevronDown, Trash2, UserRound, X} from "lucide-react";
import {useEffect, useMemo, useRef, useState} from "react";
import {createPortal} from "react-dom";
import {toast} from "sonner";

import type {
    AdmissionProcessKanbanColumn
} from "@/modules/cfg/settings/admissionprocesskanban/dto/admission-process-kanban-column.dto";
import {candidateKeys} from "@/modules/rh/person/candidate/candidate.query";
import {candidateService} from "@/modules/rh/person/candidate/services/candidate.service";
import {CandidateProfileView} from "@/modules/rh/person/jobvacancy/components/CandidateProfileView";
import {HIRING_KANBAN_COLUMN_KEY} from "@/modules/rh/person/jobvacancy/lib/create-admission-from-kanban-card";
import type {JobVacancyApplication} from "@/modules/rh/person/jobvacancyapplication/dto/job-vacancy-application.dto";
import {jobVacancyApplicationKeys} from "@/modules/rh/person/jobvacancyapplication/job-vacancy-application.query";
import {
    jobVacancyApplicationService
} from "@/modules/rh/person/jobvacancyapplication/services/job-vacancy-application.service";
import {resolveKanbanColumnColor} from "@/shared/components/kanban";
import {Button} from "@/shared/components/ui/Button";
import {fieldClass} from "@/shared/components/ui/input/InputFieldChrome";
import {ExceptionCapture} from "@/shared/exceptions";
import {formatCellValue} from "@/shared/lib/table/format-cell-value";
import {SystemAlert} from "@/shared/system-alert";
import {TableDataType} from "@/shared/types/table.types";

type JobVacancyApplicationKanbanDetailModalProps = {
    open: boolean;
    application: JobVacancyApplication | null;
    columns: AdmissionProcessKanbanColumn[];
    onClose: () => void;
    onCreateAdmission?: () => void;
    createAdmissionLoading?: boolean;
};

type EditableStageComment = {
    columnKey: string;
    title: string;
    color?: string | null;
    updatedAt?: string;
    order: number;
    isCurrent: boolean;
};

function DetailField({label, value}: { label: string; value: string }) {
    return (
        <div className="min-w-0 rounded-lg border border-base-content/8 bg-base-content/[0.02] px-3 py-2.5">
            <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.04em] text-base-content/40">
                {label}
            </p>
            <p className="mt-1 text-sm font-medium text-base-content">{value || "—"}</p>
        </div>
    );
}

function StageCommentAccordion({
                                   title,
                                   value,
                                   updatedAt,
                                   columnColor,
                                   defaultOpen,
                                   disabled,
                                   canDelete,
                                   deleteLoading,
                                   onChange,
                                   onDelete,
                               }: {
    title: string;
    value: string;
    updatedAt?: string;
    columnColor?: string | null;
    defaultOpen?: boolean;
    disabled?: boolean;
    canDelete?: boolean;
    deleteLoading?: boolean;
    onChange: (value: string) => void;
    onDelete?: () => void;
}) {
    const [open, setOpen] = useState(Boolean(defaultOpen));
    const color = resolveKanbanColumnColor(columnColor);

    return (
        <div
            className="overflow-hidden rounded-lg border border-base-content/10"
            style={{
                borderLeftColor: color,
                borderLeftWidth: 3,
                background: `color-mix(in srgb, ${color} 6%, transparent)`,
            }}
        >
            <div className="flex h-9 items-center gap-0.5 px-1.5">
                <button
                    type="button"
                    className="flex h-full min-w-0 flex-1 items-center gap-2 rounded-md px-1 text-left transition-colors hover:bg-base-content/[0.03]"
                    aria-expanded={open}
                    onClick={() => setOpen((current) => !current)}
                >
                    <span
                        className="size-1.5 shrink-0 rounded-full"
                        style={{backgroundColor: color}}
                        aria-hidden
                    />
                    <span className="min-w-0 flex-1 truncate text-xs font-semibold text-base-content">
                        {title}
                    </span>
                </button>
                <button
                    type="button"
                    aria-label={`Excluir comentário de ${title}`}
                    title="Excluir comentário"
                    disabled={!canDelete || disabled || deleteLoading}
                    aria-hidden={!canDelete}
                    tabIndex={canDelete ? 0 : -1}
                    className={clsx(
                        "inline-flex size-7 shrink-0 items-center justify-center rounded-md transition-colors",
                        canDelete
                            ? "text-base-content/35 hover:bg-error/10 hover:text-error disabled:opacity-40"
                            : "invisible pointer-events-none",
                    )}
                    onClick={(event) => {
                        event.stopPropagation();
                        if (!canDelete) return;
                        onDelete?.();
                    }}
                >
                    <Trash2 className="size-3.5" strokeWidth={2.25}/>
                </button>
                <button
                    type="button"
                    aria-label={open ? "Recolher" : "Expandir"}
                    aria-expanded={open}
                    className="inline-flex size-7 shrink-0 items-center justify-center rounded-md text-base-content/40 transition-colors hover:bg-base-content/[0.03]"
                    onClick={() => setOpen((current) => !current)}
                >
                    <ChevronDown
                        className={clsx(
                            "size-3.5 transition-transform",
                            open && "rotate-180",
                        )}
                        strokeWidth={2.25}
                    />
                </button>
            </div>
            {open ? (
                <div className="border-t border-base-content/8 bg-base-100/70 px-2.5 py-2">
                    <textarea
                        rows={6}
                        value={value}
                        disabled={disabled}
                        onChange={(event) => onChange(event.target.value)}
                        className={clsx(
                            "gommo-control inline-block! h-auto! min-h-28! items-start! overflow-auto! leading-normal! px-2.5! py-2! w-full resize-y text-xs",
                            fieldClass(),
                        )}
                    />
                    {updatedAt ? (
                        <p className="mt-1.5 text-[0.625rem] text-base-content/40">
                            Atualizado em {formatCellValue(updatedAt, TableDataType.DATETIME)}
                        </p>
                    ) : null}
                </div>
            ) : null}
        </div>
    );
}

function CandidateProfileAccordion({
                                       candidateId,
                                       defaultOpen = true,
                                   }: {
    candidateId: string;
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);
    const detailQuery = useQuery({
        queryKey: candidateKeys.detail(candidateId),
        queryFn: () => candidateService.getById(candidateId),
        enabled: open && Boolean(candidateId),
    });

    return (
        <div className="overflow-hidden rounded-lg border border-base-content/10">
            <button
                type="button"
                className="flex h-9 w-full items-center gap-2 px-2.5 text-left transition-colors hover:bg-base-content/[0.03]"
                aria-expanded={open}
                onClick={() => setOpen((current) => !current)}
            >
                <UserRound className="size-3.5 shrink-0 text-base-content/45" strokeWidth={2.25}/>
                <span className="min-w-0 flex-1 truncate text-xs font-semibold text-base-content">
                    Perfil do candidato
                </span>
                <ChevronDown
                    className={clsx("size-3.5 text-base-content/40 transition-transform", open && "rotate-180")}
                    strokeWidth={2.25}
                />
            </button>
            {open ? (
                <div className="border-t border-base-content/8 bg-base-100/70 px-3 py-3">
                    {detailQuery.isLoading ? (
                        <div className="grid gap-3 sm:grid-cols-2">
                            {Array.from({length: 4}).map((_, i) => (
                                <div key={i} className="skeleton-shimmer h-14 w-full rounded-lg"/>
                            ))}
                        </div>
                    ) : null}
                    {detailQuery.isError ? (
                        <p className="text-xs text-error">
                            {ExceptionCapture.displayMessage(
                                detailQuery.error,
                                "Não foi possível carregar o perfil do candidato.",
                            )}
                        </p>
                    ) : null}
                    {detailQuery.data ? <CandidateProfileView candidate={detailQuery.data}/> : null}
                </div>
            ) : null}
        </div>
    );
}

function buildDraftsFromApplication(
    application: JobVacancyApplication,
    stageKeys: string[],
): Record<string, string> {
    const drafts: Record<string, string> = {};
    for (const key of stageKeys) {
        drafts[key] = application.stageComments?.[key]?.text ?? "";
    }
    return drafts;
}

export function JobVacancyApplicationKanbanDetailModal({
                                                           open,
                                                           application,
                                                           columns,
                                                           onClose,
                                                           onCreateAdmission,
                                                           createAdmissionLoading = false,
                                                       }: JobVacancyApplicationKanbanDetailModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const queryClient = useQueryClient();
    const [mounted, setMounted] = useState(false);
    const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

    const currentColumnKey = application?.kanbanColumnKey?.trim() ?? "";
    const currentColumnName =
        columns.find((column) => column.columnKey === currentColumnKey)?.name ?? currentColumnKey;
    const showCreateAdmission =
        Boolean(onCreateAdmission) && currentColumnKey === HIRING_KANBAN_COLUMN_KEY;

    const editableStages = useMemo((): EditableStageComment[] => {
        if (!application) return [];

        const columnOrder = new Map(
            columns.map((column, index) => [column.columnKey, index] as const),
        );
        const comments = application.stageComments ?? {};
        const keys = new Set<string>();

        for (const [columnKey, value] of Object.entries(comments)) {
            if (value?.text?.trim()) keys.add(columnKey);
        }
        if (currentColumnKey) keys.add(currentColumnKey);

        return [...keys]
            .map((columnKey) => {
                const column = columns.find((item) => item.columnKey === columnKey);
                return {
                    columnKey,
                    title: column?.name ?? columnKey,
                    color: column?.color,
                    updatedAt: comments[columnKey]?.updatedAt,
                    order: columnOrder.get(columnKey) ?? Number.MAX_SAFE_INTEGER,
                    isCurrent: columnKey === currentColumnKey,
                };
            })
            .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));
    }, [application, columns, currentColumnKey]);

    const stageKeys = useMemo(
        () => editableStages.map((stage) => stage.columnKey),
        [editableStages],
    );

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open) {
            if (!dialog.open) dialog.showModal();
        } else if (dialog.open) {
            dialog.close();
        }
    }, [open]);

    useEffect(() => {
        if (!open || !application) return;
        setCommentDrafts(buildDraftsFromApplication(application, stageKeys));
    }, [open, application, stageKeys]);

    const dirtyEntries = useMemo(() => {
        if (!application) return [];
        return stageKeys.filter((key) => {
            const draft = commentDrafts[key] ?? "";
            const saved = application.stageComments?.[key]?.text ?? "";
            return draft !== saved;
        });
    }, [application, commentDrafts, stageKeys]);

    const syncApplicationCache = async (updated: JobVacancyApplication) => {
        setCommentDrafts(buildDraftsFromApplication(updated, stageKeys));
        if (updated.jobVacancyId) {
            queryClient.setQueryData(
                jobVacancyApplicationKeys.byVacancy(updated.jobVacancyId),
                (current: JobVacancyApplication[] | undefined) => {
                    if (!current) return current;
                    return current.map((row) => (row.id === updated.id ? updated : row));
                },
            );
            await queryClient.invalidateQueries({
                queryKey: jobVacancyApplicationKeys.byVacancy(updated.jobVacancyId),
            });
        }
        await queryClient.invalidateQueries({queryKey: jobVacancyApplicationKeys.all});
    };

    const saveMutation = useMutation({
        mutationFn: async () => {
            if (!application) throw new Error("Candidatura inválida.");
            let latest = application;
            for (const columnKey of dirtyEntries) {
                latest = await jobVacancyApplicationService.upsertStageComment(application.id, {
                    columnKey,
                    text: commentDrafts[columnKey] ?? "",
                });
            }
            return latest;
        },
        onSuccess: async (updated) => {
            toast.success("Alterações salvas");
            await syncApplicationCache(updated);
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, {
                fallbackMessage: "Não foi possível salvar os comentários.",
            }),
    });

    const deleteMutation = useMutation({
        mutationFn: (columnKey: string) =>
            jobVacancyApplicationService.upsertStageComment(application!.id, {
                columnKey,
                text: "",
            }),
        onSuccess: async (updated) => {
            toast.success("Comentário excluído");
            await syncApplicationCache(updated);
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, {
                fallbackMessage: "Não foi possível excluir o comentário.",
            }),
    });

    const handleDeleteComment = async (columnKey: string) => {
        if (!(await SystemAlert.confirmDelete("Deseja excluir o comentário desta etapa?"))) return;
        deleteMutation.mutate(columnKey);
    };

    const canSave =
        dirtyEntries.length > 0 &&
        !saveMutation.isPending &&
        !deleteMutation.isPending &&
        !createAdmissionLoading;
    const busy = saveMutation.isPending || deleteMutation.isPending || createAdmissionLoading;

    if (!mounted) return null;

    return createPortal(
        <dialog ref={dialogRef} className="modal" onClose={onClose}>
            <div className="modal-box flex max-h-[88vh] w-full max-w-4xl flex-col overflow-hidden p-0">
                <div className="flex items-start justify-between gap-3 border-b border-base-content/10 px-5 py-4">
                    <div className="min-w-0">
                        <h3 className="text-base font-semibold text-base-content">Detalhe do card</h3>
                        <p className="mt-0.5 truncate text-sm text-base-content/55">
                            {application?.candidateFullName ?? "Candidato"}
                            {currentColumnName ? ` · ${currentColumnName}` : ""}
                        </p>
                    </div>
                    <button
                        type="button"
                        aria-label="Fechar"
                        className="gommo-btn gommo-btn--ghost gommo-btn--icon-only shrink-0 text-base-content/50"
                        onClick={onClose}
                    >
                        <X className="size-4" strokeWidth={2}/>
                    </button>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                    {application ? (
                        <div className="grid gap-5">
                            <section className="grid gap-3 sm:grid-cols-2">
                                <DetailField
                                    label="Etapa atual"
                                    value={currentColumnName || "—"}
                                />
                                <DetailField
                                    label="Candidatura"
                                    value={formatCellValue(application.appliedAt, TableDataType.DATETIME)}
                                />
                            </section>

                            {application.candidateId ? (
                                <section className="grid gap-2 text-xs">
                                    <CandidateProfileAccordion
                                        candidateId={application.candidateId}
                                        defaultOpen
                                    />
                                </section>
                            ) : null}

                            <section className="grid gap-2 text-xs">
                                <div>
                                    <h4 className="text-xs font-semibold text-base-content">
                                        Comentários por etapa
                                    </h4>
                                </div>

                                {editableStages.length === 0 ? (
                                    <p className="rounded-lg border border-dashed border-base-content/15 px-3 py-3 text-xs text-base-content/45">
                                        Nenhuma etapa disponível para comentário.
                                    </p>
                                ) : (
                                    <div className="grid gap-1.5">
                                        {editableStages.map((stage) => {
                                            const draft = commentDrafts[stage.columnKey] ?? "";
                                            const saved =
                                                application.stageComments?.[stage.columnKey]?.text ??
                                                "";
                                            const hasComment = Boolean(draft.trim() || saved.trim());
                                            return (
                                                <StageCommentAccordion
                                                    key={stage.columnKey}
                                                    title={
                                                        stage.isCurrent
                                                            ? `${stage.title} (atual)`
                                                            : stage.title
                                                    }
                                                    value={draft}
                                                    updatedAt={stage.updatedAt}
                                                    columnColor={stage.color}
                                                    defaultOpen={stage.isCurrent}
                                                    disabled={busy}
                                                    canDelete={hasComment}
                                                    deleteLoading={
                                                        deleteMutation.isPending &&
                                                        deleteMutation.variables === stage.columnKey
                                                    }
                                                    onChange={(value) =>
                                                        setCommentDrafts((current) => ({
                                                            ...current,
                                                            [stage.columnKey]: value,
                                                        }))
                                                    }
                                                    onDelete={() =>
                                                        void handleDeleteComment(stage.columnKey)
                                                    }
                                                />
                                            );
                                        })}
                                    </div>
                                )}
                            </section>
                        </div>
                    ) : null}
                </div>

                <div className="flex flex-wrap justify-end gap-2 border-t border-base-content/10 px-5 py-3">
                    <Button type="button" variant="ghost" disabled={busy} onClick={onClose}>
                        Fechar
                    </Button>
                    <Button
                        type="button"
                        variant={showCreateAdmission ? "outline" : undefined}
                        loading={saveMutation.isPending}
                        disabled={!canSave}
                        onClick={() => saveMutation.mutate()}
                    >
                        Salvar
                    </Button>
                    {showCreateAdmission ? (
                        <Button
                            type="button"
                            loading={createAdmissionLoading}
                            disabled={busy || !application?.candidateId}
                            onClick={onCreateAdmission}
                        >
                            Criar Admissão
                        </Button>
                    ) : null}
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button type="submit" aria-label="Fechar">
                    close
                </button>
            </form>
        </dialog>,
        document.body,
    );
}
