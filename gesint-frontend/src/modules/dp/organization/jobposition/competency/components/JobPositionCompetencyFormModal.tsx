"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import clsx from "clsx";
import { type FormEvent, useCallback, useEffect, useId, useMemo, useState } from "react";
import { toast } from "sonner";

import { DevelopmentPlanDomainService } from "@/modules/cfg/settings/developmentplan/services/development-plan-domain.service";
import type {
    JobPositionCompetencyCreateDto,
    JobPositionCompetencyExpectedLevel,
    JobPositionCompetencyUsage,
} from "@/modules/dp/organization/jobposition/competency/dto/job-position-competency.dto";
import { jobPositionCompetencyKeys } from "@/modules/dp/organization/jobposition/competency/job-position-competency.query";
import {
    emptyJobPositionCompetencyForm,
    jobPositionCompetencyToApiPayload,
    jobPositionCompetencyToFormDto,
} from "@/modules/dp/organization/jobposition/competency/lib/job-position-competency.mapper";
import {
    buildExpectedLevelSelectItems,
    JOB_POSITION_COMPETENCY_USAGE_ITEMS,
} from "@/modules/dp/organization/jobposition/competency/lib/job-position-competency.options";
import { jobPositionCompetencyService } from "@/modules/dp/organization/jobposition/competency/services/job-position-competency.service";
import { JOBPOSITION_CLIENT_MESSAGES } from "@/modules/dp/organization/jobposition/exceptions/jobposition.messages";
import { developmentPlanDomainOptionsService } from "@/modules/rh/person/developmentplan/services/development-plan-domain-options.service";
import { useFormDirtyByComparison } from "@/shared/components/crud/useFormDirtyByComparison";
import { Button } from "@/shared/components/ui/Button";
import {
    InputAutocomplete,
    InputCheckbox,
    InputDate,
    InputSelect,
} from "@/shared/components/ui/input/index";
import type { SelectItem } from "@/shared/components/ui/input/select-item.types";
import { Modal } from "@/shared/components/ui/Modal";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

const COMPETENCY_OPTIONS = {
    endpoint: "/api/v1/development/competencies",
    labelField: "name" as const,
    descriptionField: "type" as const,
};

const proficiencyLevelService = new DevelopmentPlanDomainService("/api/v1/development/proficiency-levels");

type JobPositionCompetencyFormModalProps = {
    open: boolean;
    onClose: () => void;
    jobPositionId: string;
    requirementId?: string | null;
    onSaved?: () => void;
};

export function JobPositionCompetencyFormModal({
    open,
    onClose,
    jobPositionId,
    requirementId,
    onSaved,
}: JobPositionCompetencyFormModalProps) {
    const formId = useId();
    const queryClient = useQueryClient();
    const isEditing = Boolean(requirementId);
    const [form, setForm] = useState<JobPositionCompetencyCreateDto>(() =>
        emptyJobPositionCompetencyForm(jobPositionId),
    );
    const [baseline, setBaseline] = useState<JobPositionCompetencyCreateDto | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [versionNumber, setVersionNumber] = useState<number | undefined>();

    const detailQuery = useQuery({
        queryKey: jobPositionCompetencyKeys.detail(requirementId ?? ""),
        queryFn: () => jobPositionCompetencyService.getById(requirementId!),
        enabled: open && isEditing && Boolean(requirementId),
    });

    const proficiencyLevelsQuery = useQuery({
        queryKey: ["development-proficiency-levels", "job-position-competency-modal"],
        queryFn: () => proficiencyLevelService.getAll({ status: "ACTIVE" }),
        enabled: open,
        staleTime: 60_000,
    });

    const expectedLevelItems = useMemo(() => {
        const catalogByOrder: Partial<Record<number, { name?: string; description?: string }>> = {};
        for (const level of proficiencyLevelsQuery.data ?? []) {
            const order = level.levelOrder;
            if (order == null || order < 1 || order > 4) continue;
            catalogByOrder[order] = {
                name: level.name,
                description: level.description,
            };
        }
        return buildExpectedLevelSelectItems(catalogByOrder);
    }, [proficiencyLevelsQuery.data]);

    useEffect(() => {
        if (!open) return;
        if (isEditing) {
            if (detailQuery.data) {
                const next = jobPositionCompetencyToFormDto(detailQuery.data);
                next.jobPositionId = jobPositionId;
                setForm(next);
                setBaseline(next);
                setVersionNumber(detailQuery.data.versionNumber);
                setError(null);
            }
            return;
        }
        const next = emptyJobPositionCompetencyForm(jobPositionId);
        setForm(next);
        setBaseline(next);
        setVersionNumber(undefined);
        setError(null);
    }, [open, isEditing, detailQuery.data, jobPositionId]);

    const isDirty = useFormDirtyByComparison(form, baseline);

    const saveMutation = useMutation({
        mutationFn: async (dto: JobPositionCompetencyCreateDto) => {
            const payload = jobPositionCompetencyToApiPayload({ ...dto, jobPositionId });
            if (isEditing && requirementId) {
                return jobPositionCompetencyService.update(requirementId, payload as never);
            }
            return jobPositionCompetencyService.create(payload as never);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: jobPositionCompetencyKeys.all });
            if (requirementId) {
                await queryClient.invalidateQueries({
                    queryKey: jobPositionCompetencyKeys.detail(requirementId),
                });
            }
            toast.success(isEditing ? "Nova versão da competência criada" : "Competência vinculada");
            onSaved?.();
            onClose();
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: JOBPOSITION_CLIENT_MESSAGES.COMPETENCY_SAVE_FAILED,
            });
            setError(ex.displayMessage);
        },
    });

    const update = useCallback(
        <K extends keyof JobPositionCompetencyCreateDto>(
            field: K,
            value: JobPositionCompetencyCreateDto[K],
        ) => {
            setForm((prev) => ({ ...prev, [field]: value }));
        },
        [],
    );

    const toggleUsage = (value: JobPositionCompetencyUsage, checked: boolean) => {
        setForm((prev) => {
            const current = new Set(prev.usedIn);
            if (checked) current.add(value);
            else current.delete(value);
            return { ...prev, usedIn: [...current] };
        });
    };

    const searchCompetencies = useCallback(
        (query: string, page: number) => developmentPlanDomainOptionsService.search(COMPETENCY_OPTIONS, query, page),
        [],
    );

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
            setError("Salve o cargo antes de vincular competências.");
            return;
        }
        if (!form.competencyId) {
            setError("Selecione a competência do catálogo.");
            return;
        }
        if (!form.expectedLevel) {
            setError("Selecione o nível esperado.");
            return;
        }
        if (!form.validFrom) {
            setError("Informe a data de início da vigência.");
            return;
        }
        saveMutation.mutate(form);
    };

    return (
        <Modal
            open={open}
            onClose={() => void requestClose()}
            title={isEditing ? "Editar competência exigida" : "Adicionar competência"}
            subtitle={
                isEditing
                    ? `Versão atual v${versionNumber ?? "—"}. Salvar cria uma nova versão.`
                    : "Vinda do catálogo. O nível esperado orienta seleção, experiência e desempenho."
            }
            layoutClassName="max-h-[90vh] w-[min(48rem,92vw)] max-w-[min(48rem,92vw)]"
            footer={
                <div className="flex items-center justify-end gap-2">
                    <Button type="button" variant="ghost" onClick={() => void requestClose()}>
                        Cancelar
                    </Button>
                    <Button type="submit" form={formId} loading={saveMutation.isPending}>
                        {isEditing ? "Criar nova versão" : "Cadastrar"}
                    </Button>
                </div>
            }
        >
            <form id={formId} onSubmit={handleSubmit}>
                    {isEditing && detailQuery.isLoading ? (
                                <div className="grid gap-2">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="skeleton-shimmer h-10 w-full" />
                                    ))}
                                </div>
                            ) : (
                                <div className="gesint-form-body grid grid-cols-1 gap-4 sm:grid-cols-12">
                                    <InputAutocomplete
                                        label="Competência"
                                        value={form.competencyId}
                                        selectedLabel={form.competencyName ?? ""}
                                        onSearch={searchCompetencies}
                                        onValueChange={(v, selected?: SelectItem) => {
                                            update("competencyId", v);
                                            update("competencyName", selected?.label ?? "");
                                        }}
                                        required
                                        wrapperClassName="sm:col-span-5"
                                    />
                                    <InputSelect
                                        label="Nível esperado"
                                        items={expectedLevelItems}
                                        value={form.expectedLevel}
                                        onValueChange={(v) =>
                                            update(
                                                "expectedLevel",
                                                (v || "LEVEL_2") as JobPositionCompetencyExpectedLevel,
                                            )
                                        }
                                        required
                                        wrapperClassName="sm:col-span-4"
                                    />
                                    <InputDate
                                        label="Vigente de"
                                        value={form.validFrom}
                                        onValueChange={(v) => update("validFrom", v)}
                                        required
                                        wrapperClassName="sm:col-span-3"
                                    />
                                    <div className="sm:col-span-12">
                                        <div className="mb-3 flex items-center justify-between gap-3">
                                            <h4 className="text-sm font-semibold text-base-content">Usada em</h4>
                                            <span className="text-xs text-base-content/55">
                                                {form.usedIn.length} selecionado(s)
                                            </span>
                                        </div>
                                        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                                            {JOB_POSITION_COMPETENCY_USAGE_ITEMS.map((item) => {
                                                const checked = form.usedIn.includes(item.value);
                                                return (
                                                    <InputCheckbox
                                                        key={item.value}
                                                        size="xs"
                                                        checked={checked}
                                                        onCheckedChange={(next) =>
                                                            toggleUsage(item.value, next)
                                                        }
                                                        label={item.label}
                                                        className={clsx(
                                                            "min-h-9 rounded-lg border px-3 py-2 transition-colors",
                                                            checked
                                                                ? "border-primary/35 bg-primary/8 text-primary"
                                                                : "border-base-300/50 bg-base-200/20 text-base-content/85 hover:bg-base-200/40",
                                                        )}
                                                        labelClassName={clsx(
                                                            "text-sm",
                                                            checked
                                                                ? "font-medium text-primary"
                                                                : "text-base-content/75",
                                                        )}
                                                    />
                                                );
                                            })}
                                        </div>
                                    </div>
                                    {error ? (
                                        <p className="text-sm font-medium text-error sm:col-span-12">{error}</p>
                                    ) : null}
                                </div>
                            )}
                </form>
        </Modal>
    );
}
