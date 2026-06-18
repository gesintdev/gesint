"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type SubmitEvent,useEffect, useState } from "react";
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
    type VacationFormState,
    vacationFormToRhLeaveDtos,
} from "@/modules/rh/person/vacation/lib/vacation-request.mapper";
import { maxPecuniaryDays, vacationDaysEntitled } from "@/modules/rh/person/vacation/lib/vacation-rules";
import {
    type VacationRequestFormSchema,
    vacationRequestFormSchema,
} from "@/modules/rh/person/vacation/schemas/vacation-request.schema";
import type { VacationPeriodContext } from "@/modules/rh/person/vacation/types/vacation.types";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { Button } from "@/shared/components/ui/Button";
import { FormSection } from "@/shared/components/ui/FormSection";
import { type FormStepNavItem } from "@/shared/components/ui/FormStepper";
import { InputString } from "@/shared/components/ui/input/index";
import { ExceptionCapture } from "@/shared/exceptions";
import { mapZodFieldErrors } from "@/shared/lib/zod-field-errors";

const FORM_STEPS: FormStepNavItem[] = [
    { id: "periodos", label: "Períodos" },
    { id: "registro", label: "Solicitação" },
];

type FormField = keyof VacationFormState | "periods";

const PREFILL_STORAGE_KEY = "gommo-vacation-request-prefill";

export function LeaveVacationRequestFormClient() {
    const { goToList, isEditing } = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<VacationFormState>(() => ({
        ...emptyVacationForm(),
        approved: false,
    }));
    const [error, setError] = useState<string | null>(null);
    const [fieldErrors, setFieldErrors] = useState<Partial<Record<FormField, string>>>({});
    const [periodContext, setPeriodContext] = useState<VacationPeriodContext | null>(null);
    const [contextLoading, setContextLoading] = useState(false);
    const [absenceLoading, setAbsenceLoading] = useState(false);

    useEffect(() => {
        if (isEditing) return;
        const raw = window.sessionStorage.getItem(PREFILL_STORAGE_KEY);
        if (!raw) return;
        window.sessionStorage.removeItem(PREFILL_STORAGE_KEY);
        try {
            const prefill = JSON.parse(raw) as Partial<VacationFormState>;
            setForm((prev) => ({
                ...prev,
                ...prefill,
                approved: false,
                vacationDaysEntitled: vacationDaysEntitled(prefill.unjustifiedAbsences ?? 0),
            }));
        } catch {
            // ignore invalid prefill
        }
    }, [isEditing]);

    useEffect(() => {
        if (!form.collaboratorId) {
            setPeriodContext(null);
            return;
        }
        let cancelled = false;
        setContextLoading(true);
        void loadCollaboratorVacationContext(
            form.collaboratorId,
            form.unjustifiedAbsences,
            form.acquisitionPeriodStart,
        )
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
    }, [form.acquisitionPeriodStart, form.collaboratorId, form.unjustifiedAbsences]);

    useEffect(() => {
        const acquisition = periodContext?.acquisition;
        if (!form.collaboratorId || !acquisition?.start || !acquisition.end) return;
        let cancelled = false;
        setAbsenceLoading(true);
        void leaverequestService
            .absenceSummary(form.collaboratorId, acquisition.start, acquisition.end)
            .then((summary) => {
                if (cancelled) return;
                setForm((prev) => ({
                    ...prev,
                    unjustifiedAbsences: summary.unjustifiedAbsences,
                    justifiedAbsences: summary.justifiedAbsences,
                    vacationDaysEntitled: vacationDaysEntitled(summary.unjustifiedAbsences),
                }));
            })
            .finally(() => {
                if (!cancelled) setAbsenceLoading(false);
            });
        return () => {
            cancelled = true;
        };
    }, [form.collaboratorId, periodContext?.acquisition?.start, periodContext?.acquisition?.end]);

    const saveMutation = useMutation({
        mutationFn: async (payload: { parsed: VacationRequestFormSchema; groupId: string }) => {
            const dtoList = vacationFormToRhLeaveDtos(payload.parsed, payload.groupId);
            for (const dto of dtoList) {
                await leaverequestService.create(dto);
            }
            return dtoList[0];
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: leaverequestKeys.all });
            toast.success("Solicitação de férias enviada ao DP");
            setForm({ ...emptyVacationForm(), approved: false });
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
    const entitledDays = form.vacationDaysEntitled ?? vacationDaysEntitled(form.unjustifiedAbsences);
    const isClt = periodContext?.contractType !== "PJ";

    if (isEditing) {
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

    return (
        <CrudFormShell
            onSubmit={handleSubmit}
            stepper={{
                steps: FORM_STEPS,
                resetKey: "new",
            }}
            footer={
                <>
                    <Button type="button" variant="ghost" onClick={goToList}>
                        Cancelar
                    </Button>
                    <Button type="submit" loading={saveMutation.isPending}>
                        Enviar solicitação
                    </Button>
                </>
            }
        >
            <FormSection
                id="periodos"
                title="Colaborador e períodos legais"
                description="Mesmos cálculos do cadastro de férias do DP (CLT). Faltas e atestados são calculados automaticamente pelos registros de afastamento."
                bodyClassName="!grid-cols-1 gap-4"
            >
                {periodContext?.contractType === "PJ" ? <VacationPjNotice /> : null}
                {absenceLoading ? (
                    <p className="text-sm text-base-content/55">Atualizando faltas e atestados do período aquisitivo...</p>
                ) : null}
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
                                readOnlyAbsences
                            />
                        </div>
                    </div>
                ) : (
                    <VacationSplitPeriodsEditor
                        periods={form.periods}
                        onChange={(periods) => update("periods", periods)}
                        fieldError={fieldErrors.periods}
                    />
                )}
            </FormSection>
            <FormSection id="registro" title="Solicitação" bodyClassName="!grid-cols-1">
                <InputString
                    label="Observações para o DP"
                    value={form.notes ?? ""}
                    onValueChange={(v) => update("notes", v)}
                    wrapperClassName="min-w-0 flex-1"
                />
                <p className="text-sm text-base-content/60">
                    O Departamento Pessoal avaliará afastamentos, atestados e a concessão final das férias.
                </p>
            </FormSection>
            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
