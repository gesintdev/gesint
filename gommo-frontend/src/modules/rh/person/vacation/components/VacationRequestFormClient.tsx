"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type SubmitEvent, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

import { LEAVE_CLIENT_MESSAGES } from "@/modules/rh/person/leave/exceptions/leave-request.messages";
import { leaverequestKeys } from "@/modules/rh/person/leave/leave.query";
import { leaverequestService } from "@/modules/rh/person/leave/services/leave-request.service";
import { VacationLegalPeriodsRightColumn } from "@/modules/rh/person/vacation/components/VacationLegalPeriodsRightColumn";
import { VacationPeriodSummary } from "@/modules/rh/person/vacation/components/VacationPeriodSummary";
import { VacationPjNotice } from "@/modules/rh/person/vacation/components/VacationPjNotice";
import { VacationSplitPeriodsEditor } from "@/modules/rh/person/vacation/components/VacationSplitPeriodsEditor";
import { loadCollaboratorVacationContext } from "@/modules/rh/person/vacation/lib/collaborator-vacation-context";
import {
    emptyVacationForm,
    leaveToVacationForm,
    type VacationFormState,
    vacationFormToLeaveDtos,
    vacationFormToRhLeaveDtos,
} from "@/modules/rh/person/vacation/lib/vacation-request.mapper";
import {
    maxPecuniaryDays,
    syncPeriodsWithDefaultDays,
    totalGozoDays,
    vacationDaysEntitled,
} from "@/modules/rh/person/vacation/lib/vacation-rules";
import {
    type VacationRequestFormSchema,
    vacationRequestFormSchema,
} from "@/modules/rh/person/vacation/schemas/vacation-request.schema";
import type { VacationPeriodContext } from "@/modules/rh/person/vacation/types/vacation.types";
import { CollaboratorPickerField } from "@/shared/components/crud/CollaboratorPickerField";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { Button } from "@/shared/components/ui/Button";
import { FormSection } from "@/shared/components/ui/FormSection";
import { type FormStepNavItem } from "@/shared/components/ui/FormStepper";
import { InputSelect, InputString } from "@/shared/components/ui/input/index";
import type { SelectItem } from "@/shared/components/ui/input/select-item.types";
import { ExceptionCapture } from "@/shared/exceptions";
import { mapZodFieldErrors } from "@/shared/lib/zod-field-errors";

export type VacationFormMode = "dp" | "rh";

type VacationRequestFormClientProps = {
    mode?: VacationFormMode;
};

const APPROVAL_ITEMS: SelectItem[] = [
    { value: "true", label: "Aprovado / concedido" },
    { value: "false", label: "Pendente" },
];

const PREFILL_STORAGE_KEY = "gommo-vacation-request-prefill";

type FormField = keyof VacationFormState | "periods";

function formSteps(mode: VacationFormMode): FormStepNavItem[] {
    return [
        { id: "periodos", label: "Períodos" },
        { id: "registro", label: mode === "rh" ? "Solicitação" : "Registro" },
    ];
}

export function VacationRequestFormClient({ mode = "dp" }: VacationRequestFormClientProps) {
    const isRh = mode === "rh";
    const { editingId, isEditing, goToList, startCreate } = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<VacationFormState>(() => ({
        ...emptyVacationForm(),
        approved: isRh ? false : true,
    }));
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<FormField, string>>>({});
    const [periodContext, setPeriodContext] = useState<VacationPeriodContext | null>(null);
    const [periodLoading, setPeriodLoading] = useState(false);
    /** Período aquisitivo escolhido pelo usuário; null = período ativo padrão. */
    const [acquisitionOverride, setAcquisitionOverride] = useState<string | null>(null);
    const formRef = useRef(form);
    formRef.current = form;
    const detailQuery = useQuery({
        queryKey: leaverequestKeys.detail(editingId ?? ""),
        queryFn: () => leaverequestService.getById(editingId!),
        enabled: !isRh && isEditing && Boolean(editingId),
    });

    useEffect(() => {
        if (!isRh || isEditing) return;
        const raw = window.sessionStorage.getItem(PREFILL_STORAGE_KEY);
        if (!raw) return;
        window.sessionStorage.removeItem(PREFILL_STORAGE_KEY);
        try {
            const prefill = JSON.parse(raw) as Partial<VacationFormState>;
            setForm((prev) => ({
                ...prev,
                ...prefill,
                approved: false,
                vacationDaysEntitled: prefill.recessPeriodId
                    ? prefill.vacationDaysEntitled
                    : vacationDaysEntitled(prefill.unjustifiedAbsences ?? 0),
            }));
            setAcquisitionOverride(prefill.acquisitionPeriodStart?.trim() || null);
        } catch {
            // ignore invalid prefill
        }
    }, [isEditing, isRh]);

    useEffect(() => {
        if (isRh) return;
        if (!isEditing) {
            setForm(emptyVacationForm());
            setAcquisitionOverride(null);
            setError(null);
            setFieldErrors({});
            setPeriodContext(null);
            return;
        }

        if (detailQuery.data) {
            const next = leaveToVacationForm(detailQuery.data);
            setForm(next);
            setAcquisitionOverride(next.acquisitionPeriodStart?.trim() || null);
            setError(null);
            setFieldErrors({});
        }
    }, [detailQuery.data, isEditing, isRh]);

    useEffect(() => {
        const collaboratorId = form.collaboratorId?.trim();
        if (!collaboratorId) {
            setPeriodContext(null);
            setPeriodLoading(false);
            return;
        }

        let cancelled = false;
        setPeriodLoading(true);

        void (async () => {
            try {
                let ctx = await loadCollaboratorVacationContext(
                    collaboratorId,
                    0,
                    acquisitionOverride || undefined,
                );
                if (cancelled) return;

                let unjustifiedAbsences = 0;
                let justifiedAbsences = 0;

                if (ctx.contractType === "CLT" && ctx.acquisition?.start && ctx.acquisition?.end) {
                    const summary = await leaverequestService.absenceSummary(
                        collaboratorId,
                        ctx.acquisition.start,
                        ctx.acquisition.end,
                    );
                    if (cancelled) return;
                    unjustifiedAbsences = summary.unjustifiedAbsences;
                    justifiedAbsences = summary.justifiedAbsences;
                    ctx = await loadCollaboratorVacationContext(
                        collaboratorId,
                        unjustifiedAbsences,
                        ctx.acquisition.start,
                    );
                    if (cancelled) return;
                }

                let recessPatch: Partial<VacationFormState> = {};
                if (isRh && ctx.contractType === "PJ" && !formRef.current.recessPeriodId) {
                    const rows = await leaverequestService.getVacationEligibleCollaborators();
                    if (cancelled) return;
                    const recess = rows.find(
                        (row) => row.collaboratorId === collaboratorId && row.periodStatus === "CONTRACT_RECESS",
                    );
                    if (recess) {
                        recessPatch = {
                            acquisitionPeriodStart: recess.acquisitionStart,
                            acquisitionPeriodEnd: recess.acquisitionEnd,
                            vacationDaysEntitled: recess.entitledDays,
                            recessPeriodId: recess.recessPeriodId,
                            recessAllowSplit: recess.recessAllowSplit,
                            recessMaxSplitPeriods: recess.recessMaxSplitPeriods,
                            recessMinimumSplitDays: recess.recessMinimumSplitDays,
                        };
                    }
                }

                if (cancelled) return;

                setPeriodContext(ctx);
                setForm((prev) => ({
                    ...prev,
                    unjustifiedAbsences,
                    justifiedAbsences,
                    vacationDaysEntitled:
                        recessPatch.vacationDaysEntitled ??
                        (isRh && prev.recessPeriodId ? prev.vacationDaysEntitled : ctx.entitledDays),
                    acquisitionPeriodStart:
                        recessPatch.acquisitionPeriodStart ?? ctx.acquisition?.start ?? prev.acquisitionPeriodStart,
                    acquisitionPeriodEnd:
                        recessPatch.acquisitionPeriodEnd ?? ctx.acquisition?.end ?? prev.acquisitionPeriodEnd,
                    baseSalarySnapshot: ctx.baseSalary ?? prev.baseSalarySnapshot,
                    ...recessPatch,
                }));
            } finally {
                if (!cancelled) setPeriodLoading(false);
            }
        })();

        return () => {
            cancelled = true;
        };
    }, [acquisitionOverride, form.collaboratorId, isRh]);

    const saveMutation = useMutation({
        mutationFn: async (payload: { parsed: VacationRequestFormSchema; groupId: string }) => {
            if (isRh) {
                const dtoList = vacationFormToRhLeaveDtos(payload.parsed, payload.groupId);
                for (const dto of dtoList) {
                    await leaverequestService.create(dto);
                }
                return dtoList[0];
            }
            const dtoList = vacationFormToLeaveDtos(payload.parsed, payload.groupId);
            if (isEditing && editingId) {
                return leaverequestService.update(editingId, dtoList[0]);
            }
            for (const dto of dtoList) {
                await leaverequestService.create(dto);
            }
            return dtoList[0];
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: leaverequestKeys.all });
            if (!isRh && editingId) {
                await queryClient.invalidateQueries({ queryKey: leaverequestKeys.detail(editingId) });
            }
            toast.success(
                isRh
                    ? "Solicitação de férias enviada ao DP"
                    : isEditing
                      ? "Férias atualizadas"
                      : "Férias cadastradas",
            );
            setForm({ ...emptyVacationForm(), approved: isRh ? false : true });
            goToList();
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, { fallbackMessage: LEAVE_CLIENT_MESSAGES.LEAVE_SAVE_FAILED });
            setError(ex.displayMessage);
        },
    });
    const update = <K extends keyof VacationFormState>(field: K, value: VacationFormState[K]) => {
        setForm((prev) => {
            const next = { ...prev, [field]: value };
            if (field === "unjustifiedAbsences") {
                next.vacationDaysEntitled = vacationDaysEntitled(Number(value));
            }
            if (field === "periods") {
                const entitled = next.vacationDaysEntitled ?? vacationDaysEntitled(next.unjustifiedAbsences);
                next.periods = syncPeriodsWithDefaultDays(next.periods, entitled - next.pecuniaryAllowanceDays);
            }
            return next;
        });
        setFieldErrors((prev) => {
            if (!prev[field as FormField]) return prev;
            const next = { ...prev };
            delete next[field as FormField];
            return next;
        });
    };
    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        const parsed = vacationRequestFormSchema.safeParse(form);
        if (!parsed.success) {
            setFieldErrors(mapZodFieldErrors<FormField>(parsed.error));
            setError("Verifique os campos destacados.");
            return;
        }
        if (periodContext?.contractType === "PJ") {
            toast.message("Regime PJ: confira o contrato de prestação de serviços para o recesso.");
        }
        setFieldErrors({});
        saveMutation.mutate({ parsed: parsed.data, groupId: crypto.randomUUID() });
    };
    const maxPecuniary = maxPecuniaryDays(form.vacationDaysEntitled ?? vacationDaysEntitled(form.unjustifiedAbsences));
    const entitledDays = form.vacationDaysEntitled ?? vacationDaysEntitled(form.unjustifiedAbsences);
    const isClt = periodContext?.contractType !== "PJ";
    const requestedDays = totalGozoDays(form.periods);
    const remainingDays = Math.max(0, entitledDays - requestedDays);

    if (isRh && isEditing) {
        return (
            <div className="p-5">
                <p className="text-sm text-base-content/70">
                    No RH você pode apenas enviar novas solicitações. Consulte o histórico na listagem.
                </p>
                <Button variant="ghost" size="sm" className="mt-3" onClick={goToList}>
                    Voltar ao histórico
                </Button>
            </div>
        );
    }

    if (!isRh && isEditing && detailQuery.isLoading) {
        return (
            <div className="grid gap-2 p-5">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton-shimmer h-10 w-full" />
                ))}
            </div>
        );
    }

    if (!isRh && isEditing && detailQuery.isError) {
        return (
            <div className="p-5">
                <p className="text-sm font-medium text-error">
                    {ExceptionCapture.displayMessage(detailQuery.error, LEAVE_CLIENT_MESSAGES.LEAVE_LOAD_FAILED)}
                </p>
                <Button variant="ghost" size="sm" className="mt-3" onClick={goToList}>
                    Voltar
                </Button>
            </div>
        );
    }

    return (
        <CrudFormShell
            onSubmit={handleSubmit}
            stepper={{
                steps: formSteps(mode),
                entityCode: !isRh && isEditing ? detailQuery.data?.code : undefined,
                resetKey: isRh ? "new" : (editingId ?? "new"),
            }}
            footer={
                <>
                    <Button type="button" variant="ghost" onClick={goToList}>
                        Cancelar
                    </Button>
                    {!isRh && isEditing ? (
                        <Button type="button" variant="outline" onClick={startCreate}>
                            Novo
                        </Button>
                    ) : null}
                    <Button type="submit" loading={saveMutation.isPending}>
                        {isRh ? "Enviar solicitação" : isEditing ? "Salvar" : "Cadastrar férias"}
                    </Button>
                </>
            }
        >
            <FormSection
                id="periodos"
                title="Colaborador e períodos legais"
                description={
                    isRh
                        ? "Mesmos cálculos do cadastro de férias do DP (CLT). Faltas e atestados são calculados automaticamente pelos registros de afastamento."
                        : "Período aquisitivo (12 meses de trabalho) e concessivo (prazo para a empresa conceder as férias)."
                }
                bodyClassName="!grid-cols-1 gap-4"
            >
                {periodContext?.contractType === "PJ" ? <VacationPjNotice /> : null}

                {isClt || !form.collaboratorId ? (
                    <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 sm:items-start">
                        <div className="min-w-0">
                            <VacationPeriodSummary
                                context={periodContext}
                                loading={periodLoading}
                                collaboratorId={form.collaboratorId ?? ""}
                                onCollaboratorChange={(v) => {
                                    setAcquisitionOverride(null);
                                    setForm((prev) => ({
                                        ...prev,
                                        collaboratorId: v,
                                        acquisitionPeriodStart: "",
                                        acquisitionPeriodEnd: "",
                                        recessPeriodId: undefined,
                                        unjustifiedAbsences: 0,
                                        justifiedAbsences: 0,
                                    }));
                                    setFieldErrors((prev) => {
                                        if (!prev.collaboratorId) return prev;
                                        const next = { ...prev };
                                        delete next.collaboratorId;
                                        return next;
                                    });
                                }}
                                onAcquisitionPeriodChange={(acquisitionStart) => {
                                    setAcquisitionOverride(acquisitionStart);
                                    setForm((prev) => ({
                                        ...prev,
                                        acquisitionPeriodStart: acquisitionStart,
                                        acquisitionPeriodEnd: "",
                                    }));
                                }}
                                collaboratorError={fieldErrors.collaboratorId}
                            />
                        </div>
                        <div className="min-w-0">
                            {periodLoading && form.collaboratorId ? (
                                <div className="grid gap-2">
                                    {Array.from({ length: 4 }).map((_, i) => (
                                        <div key={i} className="skeleton-shimmer h-16 w-full rounded-lg" />
                                    ))}
                                </div>
                            ) : (
                                <VacationLegalPeriodsRightColumn
                                    entitledDays={entitledDays}
                                    unjustifiedAbsences={form.unjustifiedAbsences}
                                    justifiedAbsences={form.justifiedAbsences ?? 0}
                                    pecuniaryAllowanceDays={form.pecuniaryAllowanceDays}
                                    maxPecuniary={maxPecuniary}
                                    onUnjustifiedAbsencesChange={(v) => update("unjustifiedAbsences", v)}
                                    onJustifiedAbsencesChange={(v) => update("justifiedAbsences", v)}
                                    onPecuniaryChange={(v) => update("pecuniaryAllowanceDays", v)}
                                    pecuniaryError={fieldErrors.pecuniaryAllowanceDays}
                                    periods={form.periods}
                                    onPeriodsChange={(periods) => update("periods", periods)}
                                    periodsFieldError={fieldErrors.periods}
                                    readOnlyAbsences={isRh}
                                />
                            )}
                        </div>
                    </div>
                ) : isRh ? (
                    <div className="grid gap-4">
                        <div className="grid gap-3 rounded-lg border border-base-300/60 bg-base-200/20 p-4 sm:grid-cols-3">
                            <div>
                                <p className="text-xs text-base-content/55">Saldo contratual disponível</p>
                                <p className="mt-1 text-lg font-semibold text-base-content">{entitledDays} dias</p>
                            </div>
                            <div>
                                <p className="text-xs text-base-content/55">Dias solicitados</p>
                                <p className="mt-1 text-lg font-semibold text-base-content">{requestedDays} dias</p>
                            </div>
                            <div>
                                <p className="text-xs text-base-content/55">Saldo após esta solicitação</p>
                                <p className="mt-1 text-lg font-semibold text-primary">{remainingDays} dias</p>
                            </div>
                        </div>
                        <VacationSplitPeriodsEditor
                            periods={form.periods}
                            onChange={(periods) => update("periods", periods)}
                            fieldError={fieldErrors.periods}
                            policy="CONTRACT_RECESS"
                            maxPeriods={form.recessAllowSplit ? (form.recessMaxSplitPeriods ?? undefined) : 1}
                            minimumPeriodDays={form.recessMinimumSplitDays ?? undefined}
                        />
                    </div>
                ) : (
                    <>
                        <CollaboratorPickerField
                            value={form.collaboratorId ?? ""}
                            onValueChange={(v) => update("collaboratorId", v)}
                            required
                            error={fieldErrors.collaboratorId}
                        />
                        <VacationSplitPeriodsEditor
                            periods={form.periods}
                            onChange={(periods) => update("periods", periods)}
                            fieldError={fieldErrors.periods}
                        />
                    </>
                )}
            </FormSection>
            <FormSection
                id="registro"
                title={isRh ? "Solicitação" : "Registro"}
                bodyClassName="!grid-cols-1"
            >
                {isRh ? (
                    <>
                        <InputString
                            label="Observações para o DP"
                            value={form.notes ?? ""}
                            onValueChange={(v) => update("notes", v)}
                            wrapperClassName="min-w-0 flex-1"
                        />
                        <p className="text-sm text-base-content/60">
                            O Departamento Pessoal avaliará afastamentos, atestados e a concessão final das férias.
                        </p>
                    </>
                ) : (
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                        <InputSelect
                            label="Situação"
                            items={APPROVAL_ITEMS}
                            value={form.approved === true ? "true" : form.approved === false ? "false" : ""}
                            onValueChange={(v) => update("approved", v === "true")}
                            placeholder="Selecione"
                            clearable
                            wrapperClassName="w-full sm:w-[11rem] sm:shrink-0"
                        />
                        <InputString
                            label="Observações"
                            value={form.notes ?? ""}
                            onValueChange={(v) => update("notes", v)}
                            wrapperClassName="min-w-0 flex-1"
                        />
                    </div>
                )}
            </FormSection>
            {!isRh && isEditing && detailQuery.data?.approved !== true ? (
                <div className="grid gap-2">
                    <p className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-base-content/75">
                        Solicitação vinda do RH: revise períodos, faltas e atestados antes de aprovar.
                    </p>
                    {detailQuery.data?.reviewReason ? (
                        <p className="rounded-lg border border-warning/25 bg-warning/8 px-3 py-2 text-sm text-base-content/75">
                            Motivo anterior: {detailQuery.data.reviewReason}
                        </p>
                    ) : null}
                </div>
            ) : null}
            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
