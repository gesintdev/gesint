"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, type SubmitEvent } from "react";
import { toast } from "sonner";
import { CollaboratorPickerField } from "@/shared/components/crud/CollaboratorPickerField";
import { LEAVE_CLIENT_MESSAGES } from "@/modules/person/leave/exceptions/leave-request.messages";
import { leaverequestKeys } from "@/modules/person/leave/leave.query";
import { leaverequestService } from "@/modules/person/leave/services/leave-request.service";
import { loadCollaboratorVacationContext } from "@/modules/person/vacation/lib/collaborator-vacation-context";
import { maxPecuniaryDays, vacationDaysEntitled } from "@/modules/person/vacation/lib/vacation-rules";
import {
    emptyVacationForm,
    leaveToVacationForm,
    type VacationFormState,
    vacationFormToLeaveDtos,
} from "@/modules/person/vacation/lib/vacation-request.mapper";
import {
    vacationRequestFormSchema,
    type VacationRequestFormSchema,
} from "@/modules/person/vacation/schemas/vacation-request.schema";
import { VacationLegalPeriodsRightColumn } from "@/modules/person/vacation/components/VacationLegalPeriodsRightColumn";
import { VacationPeriodSummary } from "@/modules/person/vacation/components/VacationPeriodSummary";
import { VacationPjNotice } from "@/modules/person/vacation/components/VacationPjNotice";
import { VacationSplitPeriodsEditor } from "@/modules/person/vacation/components/VacationSplitPeriodsEditor";
import type { VacationPeriodContext } from "@/modules/person/vacation/types/vacation.types";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { EntityCodeField } from "@/shared/components/crud/EntityCodeField";
import { Button } from "@/shared/components/ui/Button";
import { FormSection } from "@/shared/components/ui/FormSection";
import { InputSelect, InputString } from "@/shared/components/ui/input/index";
import type { SelectItem } from "@/shared/components/ui/input/select-item.types";
import { ExceptionCapture } from "@/shared/exceptions";
import { mapZodFieldErrors } from "@/shared/lib/zod-field-errors";

const APPROVAL_ITEMS: SelectItem[] = [
    { value: "true", label: "Aprovado / concedido" },
    { value: "false", label: "Pendente" },
];

type FormField = keyof VacationFormState | "periods";

export function VacationRequestFormClient() {
    const { editingId, isEditing, goToList, startCreate } = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<VacationFormState>(emptyVacationForm);
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<FormField, string>>>({});
    const [periodContext, setPeriodContext] = useState<VacationPeriodContext | null>(null);
    const [contextLoading, setContextLoading] = useState(false);

    const detailQuery = useQuery({
        queryKey: leaverequestKeys.detail(editingId ?? ""),
        queryFn: () => leaverequestService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyVacationForm());
            setError(null);
            setFieldErrors({});
            setPeriodContext(null);
            return;
        }
        if (detailQuery.data) {
            setForm(leaveToVacationForm(detailQuery.data));
            setError(null);
            setFieldErrors({});
        }
    }, [isEditing, detailQuery.data]);

    useEffect(() => {
        if (!form.collaboratorId) {
            setPeriodContext(null);
            return;
        }
        let cancelled = false;
        setContextLoading(true);
        void loadCollaboratorVacationContext(form.collaboratorId, form.unjustifiedAbsences)
            .then((ctx) => {
                if (cancelled) return;
                setPeriodContext(ctx);
                setForm((prev) => ({
                    ...prev,
                    vacationDaysEntitled: ctx.entitledDays,
                    acquisitionPeriodStart: ctx.acquisition?.start ?? prev.acquisitionPeriodStart,
                    acquisitionPeriodEnd: ctx.acquisition?.end ?? prev.acquisitionPeriodEnd,
                    baseSalarySnapshot: ctx.baseSalary ?? prev.baseSalarySnapshot,
                }));
            })
            .finally(() => {
                if (!cancelled) setContextLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [form.collaboratorId, form.unjustifiedAbsences]);

    const saveMutation = useMutation({
        mutationFn: async (payload: { parsed: VacationRequestFormSchema; groupId: string }) => {
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
            if (editingId) await queryClient.invalidateQueries({ queryKey: leaverequestKeys.detail(editingId) });
            toast.success(isEditing ? "Férias atualizadas" : "Férias cadastradas");
            setForm(emptyVacationForm());
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
    const isClt = periodContext?.contractType !== "PJ";

    if (isEditing && detailQuery.isLoading) {
        return (
            <div className="grid gap-2 p-5">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton-shimmer h-10 w-full" />
                ))}
            </div>
        );
    }

    if (isEditing && detailQuery.isError) {
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
            footer={
                <>
                    <Button type="button" variant="ghost" onClick={goToList}>
                        Cancelar
                    </Button>
                    {isEditing ? (
                        <Button type="button" variant="outline" onClick={startCreate}>
                            Novo
                        </Button>
                    ) : null}
                    <Button type="submit" loading={saveMutation.isPending}>
                        {isEditing ? "Salvar" : "Cadastrar férias"}
                    </Button>
                </>
            }
        >
            <div className="grid gap-3 p-4 sm:grid-cols-2">
                <EntityCodeField code={isEditing ? detailQuery.data?.code : undefined} />

                <FormSection
                    title="Colaborador e períodos legais"
                    description="Período aquisitivo (12 meses de trabalho) e concessivo (prazo para a empresa conceder as férias)."
                    bodyClassName="!grid-cols-1 gap-4"
                >
                    {periodContext?.contractType === "PJ" ? <VacationPjNotice /> : null}

                    {isClt || !form.collaboratorId ? (
                        <div className="grid w-full grid-cols-1 gap-6 sm:grid-cols-2 sm:items-start">
                            <div className="min-w-0">
                                <VacationPeriodSummary
                                    context={periodContext}
                                    loading={contextLoading}
                                    collaboratorId={form.collaboratorId ?? ""}
                                    onCollaboratorChange={(v) => update("collaboratorId", v)}
                                    collaboratorError={fieldErrors.collaboratorId}
                                />
                            </div>
                            <div className="min-w-0">
                                <VacationLegalPeriodsRightColumn
                                    unjustifiedAbsences={form.unjustifiedAbsences}
                                    pecuniaryAllowanceDays={form.pecuniaryAllowanceDays}
                                    maxPecuniary={maxPecuniary}
                                    onUnjustifiedAbsencesChange={(v) => update("unjustifiedAbsences", v)}
                                    onPecuniaryChange={(v) => update("pecuniaryAllowanceDays", v)}
                                    pecuniaryError={fieldErrors.pecuniaryAllowanceDays}
                                    periods={form.periods}
                                    onPeriodsChange={(periods) => update("periods", periods)}
                                    periodsFieldError={fieldErrors.periods}
                                />
                            </div>
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

                <FormSection title="Registro" bodyClassName="!grid-cols-1">
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
                </FormSection>

                {isEditing && detailQuery.data?.approved !== true ? (
                    <p className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2 text-sm text-base-content/75 sm:col-span-2">
                        Solicitação vinda do RH: revise os períodos, confirme aprovação e salve.
                    </p>
                ) : null}

                {error ? <p className="text-sm font-medium text-error sm:col-span-2">{error}</p> : null}
            </div>
        </CrudFormShell>
    );
}
