"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import { CollaboratorPickerField } from "@/shared/components/crud/CollaboratorPickerField";
import { LEAVE_CLIENT_MESSAGES } from "@/modules/person/leave/exceptions/leave-request.messages";
import { leaverequestKeys } from "@/modules/person/leave/leave.query";
import { leaverequestService } from "@/modules/person/leave/services/leave-request.service";
import { loadCollaboratorVacationContext } from "@/modules/person/vacation/lib/collaborator-vacation-context";
import { estimateVacationPayment, maxPecuniaryDays, vacationDaysEntitled } from "@/modules/person/vacation/lib/vacation-rules";
import {
    emptyVacationForm,
    leaveToVacationForm,
    summarizeGozoDays,
    vacationFormToLeaveDtos,
    type VacationFormState,
} from "@/modules/person/vacation/lib/vacation-request.mapper";
import {
    vacationRequestFormSchema,
    type VacationRequestFormSchema,
} from "@/modules/person/vacation/schemas/vacation-request.schema";
import { VacationPaymentSummary } from "@/modules/person/vacation/components/VacationPaymentSummary";
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

    const paymentEstimate = useMemo(() => {
        const salary = form.baseSalarySnapshot ?? periodContext?.baseSalary ?? 0;
        const gozo = summarizeGozoDays(form);
        const firstStart = form.periods[0]?.startDate;
        return estimateVacationPayment(salary, gozo, form.pecuniaryAllowanceDays, firstStart || undefined);
    }, [form, periodContext]);

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

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
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
    const isClt = periodContext?.contractType === "CLT";

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
                >
                    <div className="grid gap-3 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <CollaboratorPickerField
                                value={form.collaboratorId ?? ""}
                                onValueChange={(v) => update("collaboratorId", v)}
                                required
                                error={fieldErrors.collaboratorId}
                            />
                        </div>
                        {periodContext?.contractType === "PJ" ? <VacationPjNotice /> : null}
                        {isClt ? <VacationPeriodSummary context={periodContext} loading={contextLoading} /> : null}
                    </div>
                </FormSection>

                <FormSection
                    title="Saldo e faltas"
                    description="Faltas injustificadas no período aquisitivo reduzem os dias de férias (tabela CLT)."
                >
                    <div className="grid gap-3 sm:grid-cols-2">
                        <InputString
                            label="Faltas injustificadas"
                            value={String(form.unjustifiedAbsences)}
                            onValueChange={(v) => update("unjustifiedAbsences", Number.parseInt(v, 10) || 0)}
                        />
                        <div>
                            <p className="text-xs font-medium text-base-content/55">Dias de direito</p>
                            <p className="mt-1 text-sm font-medium">
                                {form.vacationDaysEntitled ?? vacationDaysEntitled(form.unjustifiedAbsences)} dias
                            </p>
                        </div>
                        <InputString
                            label="Abono pecuniário (dias vendidos)"
                            value={String(form.pecuniaryAllowanceDays)}
                            onValueChange={(v) => update("pecuniaryAllowanceDays", Number.parseInt(v, 10) || 0)}
                            hint={`Máximo ${maxPecuniary} dia(s) (até 1/3)`}
                            error={fieldErrors.pecuniaryAllowanceDays}
                        />
                    </div>
                </FormSection>

                <FormSection
                    title="Períodos de gozo"
                    description="Até 3 períodos: um com mínimo de 14 dias e os demais com no mínimo 5 dias cada."
                >
                    <VacationSplitPeriodsEditor
                        periods={form.periods}
                        onChange={(periods) => update("periods", periods)}
                        fieldError={fieldErrors.periods}
                    />
                </FormSection>

                <FormSection title="Pagamento estimado" description="Salário das férias + 1/3 constitucional (antes de descontos).">
                    <VacationPaymentSummary estimate={paymentEstimate} />
                </FormSection>

                <FormSection title="Registro">
                    <div className="grid gap-3 sm:grid-cols-2">
                        <InputSelect
                            label="Situação"
                            items={APPROVAL_ITEMS}
                            value={form.approved === true ? "true" : form.approved === false ? "false" : ""}
                            onValueChange={(v) => update("approved", v === "true")}
                            placeholder="Selecione"
                            clearable
                        />
                        <div className="sm:col-span-2">
                            <InputString
                                label="Observações"
                                value={form.notes ?? ""}
                                onValueChange={(v) => update("notes", v)}
                            />
                        </div>
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
