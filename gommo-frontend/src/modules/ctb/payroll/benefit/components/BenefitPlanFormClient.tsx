"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type SubmitEvent,useEffect, useState } from "react";
import { toast } from "sonner";

import { benefitplanKeys } from "@/modules/ctb/payroll/benefit/benefit.query";
import type { BenefitPlanCreateDto } from "@/modules/ctb/payroll/benefit/dto/benefit-plan.dto";
import { BENEFIT_CLIENT_MESSAGES } from "@/modules/ctb/payroll/benefit/exceptions/benefit-plan.messages";
import { benefitplanToFormDto,emptyBenefitPlanForm } from "@/modules/ctb/payroll/benefit/lib/benefit-plan.mapper";
import { benefitplanService } from "@/modules/ctb/payroll/benefit/services/benefit-plan.service";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { Button } from "@/shared/components/ui/Button";
import { FormSection } from "@/shared/components/ui/FormSection";
import { type FormStepNavItem } from "@/shared/components/ui/FormStepper";
import { InputCurrency, InputDate,InputString } from "@/shared/components/ui/input/index";
import { ExceptionCapture } from "@/shared/exceptions";

const FORM_STEPS: FormStepNavItem[] = [{ id: "cadastro", label: "Benefício" }];

export function BenefitPlanFormClient() {
    const { editingId, isEditing, goToList, startCreate } = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<BenefitPlanCreateDto>(emptyBenefitPlanForm);
    const [error, setError] = useState<string | null>(null);
    const detailQuery = useQuery({
        queryKey: benefitplanKeys.detail(editingId ?? ""),
        queryFn: () => benefitplanService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyBenefitPlanForm());
            setError(null);
            return;
        }

        if (detailQuery.data) {
            setForm(benefitplanToFormDto(detailQuery.data));
            setError(null);
        }
    }, [isEditing, detailQuery.data]);

    const saveMutation = useMutation({
        mutationFn: async (dto: BenefitPlanCreateDto) => {
            const payload = {
                ...dto,
                monthlyValue: dto.monthlyValue ? Number(dto.monthlyValue) : undefined,
                benefitType: dto.benefitType || "OUTRO",
            };
            if (isEditing && editingId) return benefitplanService.update(editingId, payload as BenefitPlanCreateDto);
            return benefitplanService.create(payload as BenefitPlanCreateDto);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: benefitplanKeys.all });
            if (editingId) await queryClient.invalidateQueries({ queryKey: benefitplanKeys.detail(editingId) });
            toast.success(isEditing ? "Plano de benefício atualizado" : "Plano de benefício cadastrado");
            setForm(emptyBenefitPlanForm());
            goToList();
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, { fallbackMessage: BENEFIT_CLIENT_MESSAGES.BENEFIT_SAVE_FAILED });
            setError(ex.displayMessage);
        },
    });
    const update = <K extends keyof BenefitPlanCreateDto>(field: K, value: BenefitPlanCreateDto[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };
    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        saveMutation.mutate(form);
    };

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
                    {ExceptionCapture.displayMessage(detailQuery.error, BENEFIT_CLIENT_MESSAGES.BENEFIT_LOAD_FAILED)}
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
                steps: FORM_STEPS,
                entityCode: isEditing ? detailQuery.data?.code : undefined,
                resetKey: editingId ?? "new",
            }}
            footer={
                <>
                    <Button type="button" variant="ghost" onClick={goToList}>
                        Cancelar
                    </Button>
                    {isEditing && (
                        <Button type="button" variant="outline" onClick={startCreate}>
                            Novo
                        </Button>
                    )}
                    <Button type="submit" loading={saveMutation.isPending}>
                        {isEditing ? "Salvar" : "Cadastrar"}
                    </Button>
                </>
            }
        >
            <FormSection id="cadastro" title="Benefício">
                <InputString label="Nome" value={form.name ?? ""} onValueChange={(v) => update("name", v)} required />
                <InputString
                    label="Tipo de benefício"
                    value={form.benefitType ?? ""}
                    onValueChange={(v) => update("benefitType", v)}
                    required
                    hint="Ex.: SAUDE, VR, VT"
                />
                <InputCurrency
                    label="Valor mensal"
                    value={form.monthlyValue ?? ""}
                    onValueChange={(v) => update("monthlyValue", v)}
                    emitAsDecimal
                />
                <InputDate
                    label="Vigência — início"
                    value={form.startDate ?? ""}
                    onValueChange={(v) => update("startDate", v)}
                />
                <InputDate
                    label="Vigência — fim"
                    value={form.endDate ?? ""}
                    onValueChange={(v) => update("endDate", v)}
                />
                <InputString
                    label="Descrição"
                    value={form.description ?? ""}
                    onValueChange={(v) => update("description", v)}
                    wrapperClassName="sm:col-span-2"
                />
            </FormSection>
            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
