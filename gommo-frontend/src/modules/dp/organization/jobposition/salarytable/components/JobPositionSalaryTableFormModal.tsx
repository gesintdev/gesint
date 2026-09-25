"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus, Trash2, X } from "lucide-react";
import { type FormEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "sonner";

import type {
    JobPositionSalaryLevel,
    JobPositionSalaryTableCreateDto,
    JobPositionSalaryTableItemFormDto,
} from "@/modules/dp/organization/jobposition/salarytable/dto/job-position-salary-table.dto";
import { jobPositionSalaryTableKeys } from "@/modules/dp/organization/jobposition/salarytable/job-position-salary-table.query";
import {
    emptyJobPositionSalaryTableForm,
    emptySalaryTableItem,
    jobPositionSalaryTableToApiPayload,
    jobPositionSalaryTableToFormDto,
    nextAvailableSalaryLevel,
} from "@/modules/dp/organization/jobposition/salarytable/lib/job-position-salary-table.mapper";
import {
    JOB_POSITION_SALARY_LEVEL_ITEMS,
    JOB_POSITION_SALARY_LEVEL_LABELS,
} from "@/modules/dp/organization/jobposition/salarytable/lib/job-position-salary-level.options";
import { jobPositionSalaryTableService } from "@/modules/dp/organization/jobposition/salarytable/services/job-position-salary-table.service";
import { JOBPOSITION_CLIENT_MESSAGES } from "@/modules/dp/organization/jobposition/exceptions/jobposition.messages";
import { useFormDirtyByComparison } from "@/shared/components/crud/useFormDirtyByComparison";
import { Button } from "@/shared/components/ui/Button";
import { InputCurrency, InputDate, InputSelect, InputString } from "@/shared/components/ui/input/index";
import { PopoverPortalProvider } from "@/shared/components/ui/input/popover-portal";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

type JobPositionSalaryTableFormModalProps = {
    open: boolean;
    onClose: () => void;
    jobPositionId: string;
    tableId?: string | null;
    onSaved?: () => void;
};

export function JobPositionSalaryTableFormModal({
    open,
    onClose,
    jobPositionId,
    tableId,
    onSaved,
}: JobPositionSalaryTableFormModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
    const queryClient = useQueryClient();
    const isEditing = Boolean(tableId);
    const [mounted, setMounted] = useState(false);
    const [form, setForm] = useState<JobPositionSalaryTableCreateDto>(() =>
        emptyJobPositionSalaryTableForm(jobPositionId),
    );
    const [baseline, setBaseline] = useState<JobPositionSalaryTableCreateDto | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [versionNumber, setVersionNumber] = useState<number | undefined>();

    const detailQuery = useQuery({
        queryKey: jobPositionSalaryTableKeys.detail(tableId ?? ""),
        queryFn: () => jobPositionSalaryTableService.getById(tableId!),
        enabled: open && isEditing && Boolean(tableId),
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog || !mounted) return;
        if (open) {
            if (!dialog.open) dialog.showModal();
        } else if (dialog.open) {
            dialog.close();
        }
    }, [open, mounted]);

    useEffect(() => {
        if (!open) return;
        if (isEditing) {
            if (detailQuery.data) {
                const next = jobPositionSalaryTableToFormDto(detailQuery.data);
                next.jobPositionId = jobPositionId;
                next.validFrom = new Date().toISOString().slice(0, 10);
                setForm(next);
                setBaseline(next);
                setVersionNumber(detailQuery.data.versionNumber);
                setError(null);
            }
            return;
        }
        const next = emptyJobPositionSalaryTableForm(jobPositionId);
        setForm(next);
        setBaseline(next);
        setVersionNumber(undefined);
        setError(null);
    }, [open, isEditing, detailQuery.data, jobPositionId]);

    const isDirty = useFormDirtyByComparison(form, baseline);
    const canAddLevel = nextAvailableSalaryLevel(form.items) != null;

    const saveMutation = useMutation({
        mutationFn: async (dto: JobPositionSalaryTableCreateDto) => {
            const payload = jobPositionSalaryTableToApiPayload({ ...dto, jobPositionId });
            if (isEditing && tableId) return jobPositionSalaryTableService.update(tableId, payload as never);
            return jobPositionSalaryTableService.create(payload as never);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: jobPositionSalaryTableKeys.all });
            toast.success(isEditing ? "Nova versão da tabela salarial criada" : "Tabela salarial cadastrada");
            onSaved?.();
            onClose();
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: JOBPOSITION_CLIENT_MESSAGES.SALARY_TABLE_SAVE_FAILED,
            });
            setError(ex.displayMessage);
        },
    });

    const levelOptionsFor = useCallback(
        (currentLevel: JobPositionSalaryLevel) => {
            const usedElsewhere = new Set(
                form.items.filter((item) => item.level !== currentLevel).map((item) => item.level),
            );
            return JOB_POSITION_SALARY_LEVEL_ITEMS.filter((item) => !usedElsewhere.has(item.value as JobPositionSalaryLevel));
        },
        [form.items],
    );

    const updateItem = useCallback(
        (index: number, field: keyof JobPositionSalaryTableItemFormDto, value: string) => {
            setForm((prev) => ({
                ...prev,
                items: prev.items.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
            }));
        },
        [],
    );

    const addItem = () => {
        const level = nextAvailableSalaryLevel(form.items);
        if (!level) return;
        setForm((prev) => ({
            ...prev,
            items: [...prev.items, emptySalaryTableItem(level)],
        }));
    };

    const removeItem = (index: number) => {
        setForm((prev) => ({
            ...prev,
            items: prev.items.length <= 1 ? prev.items : prev.items.filter((_, i) => i !== index),
        }));
    };

    const requestClose = async () => {
        if (isDirty) {
            const confirmed = await SystemAlert.confirm({
                title: "Alterações não salvas",
                message: "Os dados não salvos serão perdidos. Deseja continuar?",
                confirmLabel: "Continuar",
                cancelLabel: "Cancelar",
                variant: "warning",
            });
            if (!confirmed) return;
        }
        onClose();
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setError(null);
        if (!jobPositionId) {
            setError("Salve o cargo antes de cadastrar a tabela salarial.");
            return;
        }
        if (!form.validFrom) {
            setError("Informe a data de início da vigência.");
            return;
        }
        if (form.items.length === 0) {
            setError("Inclua ao menos um nível na tabela.");
            return;
        }
        const levels = new Set<string>();
        for (const item of form.items) {
            if (!item.level) {
                setError("Selecione o nível de cada faixa.");
                return;
            }
            if (levels.has(item.level)) {
                setError(`Nível ${JOB_POSITION_SALARY_LEVEL_LABELS[item.level]} duplicado.`);
                return;
            }
            levels.add(item.level);
            if (!item.minSalary || !item.referenceSalary || !item.maxSalary) {
                setError(
                    `Preencha mínimo, referência e máximo do nível ${JOB_POSITION_SALARY_LEVEL_LABELS[item.level]}.`,
                );
                return;
            }
            const min = Number(item.minSalary);
            const reference = Number(item.referenceSalary);
            const max = Number(item.maxSalary);
            if (!(min <= reference && reference <= max)) {
                setError(
                    `Nível ${JOB_POSITION_SALARY_LEVEL_LABELS[item.level]}: mínimo ≤ referência ≤ máximo.`,
                );
                return;
            }
        }
        saveMutation.mutate(form);
    };

    const subtitle = useMemo(() => {
        if (isEditing) {
            return `Versão atual v${versionNumber ?? "—"}. Salvar cria uma nova tabela vigente.`;
        }
        return "Vigência na tabela; cadastre um ou mais níveis (I, II, III).";
    }, [isEditing, versionNumber]);

    if (!mounted) return null;

    return createPortal(
        <dialog
            ref={(node) => {
                dialogRef.current = node;
                if (node !== portalRoot) setPortalRoot(node);
            }}
            className="modal"
            onCancel={(event) => {
                event.preventDefault();
                void requestClose();
            }}
            onClick={(event) => {
                if (event.target === event.currentTarget) {
                    void requestClose();
                }
            }}
        >
            <PopoverPortalProvider container={portalRoot}>
                <div className="modal-box flex max-h-[90vh] w-[min(44rem,92vw)] max-w-[min(44rem,92vw)] flex-col gap-0 overflow-hidden p-0">
                    <div className="flex items-start justify-between gap-3 border-b border-base-content/8 px-5 py-4">
                        <div>
                            <h3 className="text-base font-semibold text-base-content">
                                {isEditing ? "Nova versão da tabela salarial" : "Nova tabela salarial"}
                            </h3>
                            <p className="mt-0.5 text-xs text-base-content/50">{subtitle}</p>
                        </div>
                        <button
                            type="button"
                            className="gommo-btn gommo-btn--ghost gommo-btn--icon-only shrink-0 text-base-content/50"
                            aria-label="Fechar"
                            onClick={() => void requestClose()}
                        >
                            <X className="size-4" strokeWidth={2} />
                        </button>
                    </div>

                    <form
                        className="flex min-h-0 flex-1 flex-col"
                        onSubmit={handleSubmit}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="min-h-0 flex-1 overflow-auto px-5 py-4">
                            {isEditing && detailQuery.isLoading ? (
                                <div className="grid gap-2">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="skeleton-shimmer h-10 w-full" />
                                    ))}
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
                                    <InputString
                                        label="Nome da tabela"
                                        value={form.name ?? ""}
                                        onValueChange={(v) => setForm((prev) => ({ ...prev, name: v }))}
                                        placeholder="Ex.: 2026-A"
                                        wrapperClassName="sm:col-span-6"
                                    />
                                    <InputDate
                                        label="Vigente de"
                                        value={form.validFrom}
                                        onValueChange={(v) => setForm((prev) => ({ ...prev, validFrom: v }))}
                                        required
                                        wrapperClassName="sm:col-span-6"
                                    />
                                    {form.items.map((item, index) => (
                                        <div
                                            key={`${item.level}-${index}`}
                                            className="grid grid-cols-1 gap-3 rounded-lg border border-base-content/8 p-3 sm:col-span-12 sm:grid-cols-12"
                                        >
                                            <InputSelect
                                                label="Nível"
                                                value={item.level}
                                                items={levelOptionsFor(item.level)}
                                                onValueChange={(v) =>
                                                    updateItem(index, "level", v as JobPositionSalaryLevel)
                                                }
                                                required
                                                wrapperClassName="sm:col-span-2"
                                            />
                                            <InputCurrency
                                                label="Mínimo"
                                                value={item.minSalary}
                                                onValueChange={(v) => updateItem(index, "minSalary", v)}
                                                emitAsDecimal
                                                required
                                                wrapperClassName="sm:col-span-3"
                                            />
                                            <InputCurrency
                                                label="Referência"
                                                value={item.referenceSalary}
                                                onValueChange={(v) => updateItem(index, "referenceSalary", v)}
                                                emitAsDecimal
                                                required
                                                wrapperClassName="sm:col-span-3"
                                            />
                                            <InputCurrency
                                                label="Máximo"
                                                value={item.maxSalary}
                                                onValueChange={(v) => updateItem(index, "maxSalary", v)}
                                                emitAsDecimal
                                                required
                                                wrapperClassName="sm:col-span-3"
                                            />
                                            <div className="flex items-end sm:col-span-1">
                                                <Button
                                                    type="button"
                                                    size="sm"
                                                    variant="ghost"
                                                    leftIcon={<Trash2 className="size-4" strokeWidth={2} />}
                                                    aria-label={`Remover nível ${JOB_POSITION_SALARY_LEVEL_LABELS[item.level]}`}
                                                    disabled={form.items.length <= 1}
                                                    onClick={() => removeItem(index)}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                    {canAddLevel ? (
                                        <div className="sm:col-span-12">
                                            <Button
                                                type="button"
                                                size="sm"
                                                variant="ghost"
                                                leftIcon={<Plus className="size-4" strokeWidth={2} />}
                                                onClick={addItem}
                                            >
                                                Adicionar nível
                                            </Button>
                                        </div>
                                    ) : null}
                                    {error ? (
                                        <p className="text-sm font-medium text-error sm:col-span-12">{error}</p>
                                    ) : null}
                                </div>
                            )}
                        </div>
                        <div className="flex items-center justify-end gap-2 border-t border-base-content/8 px-5 py-3">
                            <Button type="button" variant="ghost" onClick={() => void requestClose()}>
                                Cancelar
                            </Button>
                            <Button type="submit" loading={saveMutation.isPending}>
                                {isEditing ? "Criar nova versão" : "Cadastrar"}
                            </Button>
                        </div>
                    </form>
                </div>
                <button
                    type="button"
                    className="modal-backdrop"
                    aria-label="Fechar modal"
                    onClick={() => void requestClose()}
                />
            </PopoverPortalProvider>
        </dialog>,
        document.body,
    );
}
