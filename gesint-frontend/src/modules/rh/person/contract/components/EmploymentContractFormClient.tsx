"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type SubmitEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import { employmentcontractKeys } from "@/modules/rh/person/contract/contract.query";
import type { EmploymentContractCreateDto } from "@/modules/rh/person/contract/dto/employment-contract.dto";
import { CONTRACT_CLIENT_MESSAGES } from "@/modules/rh/person/contract/exceptions/employment-contract.messages";
import {
    employmentcontractToFormDto,
    emptyEmploymentContractForm,
} from "@/modules/rh/person/contract/lib/employment-contract.mapper";
import { employmentcontractService } from "@/modules/rh/person/contract/services/employment-contract.service";
import { CONTRACT_TYPE_ITEMS } from "@/modules/rh/person/collaborators/admission/lib/admission-form.constants";
import { CollaboratorPickerField } from "@/shared/components/crud/CollaboratorPickerField";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { CrudFormFooterActions } from "@/shared/components/crud/CrudFormFooterActions";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { useTrackedCrudFormDirty } from "@/shared/components/crud/useTrackedCrudFormDirty";
import { Button } from "@/shared/components/ui/Button";
import { SkeletonStack } from "@/shared/components/ui/SkeletonStack";
import { FormSection } from "@/shared/components/ui/FormSection";
import { type FormStepNavItem } from "@/shared/components/ui/FormStepper";
import { InputCurrency, InputDate, InputSelect } from "@/shared/components/ui/input/index";
import { ExceptionCapture } from "@/shared/exceptions";

const FORM_STEPS: FormStepNavItem[] = [{ id: "cadastro", label: "Contrato" }];

export function EmploymentContractFormClient() {
    const { editingId, isEditing, goToList, showSavedRecord } = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<EmploymentContractCreateDto>(emptyEmploymentContractForm);
    const [error, setError] = useState<string | null>(null);
    const detailQuery = useQuery({
        queryKey: employmentcontractKeys.detail(editingId ?? ""),
        queryFn: () => employmentcontractService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyEmploymentContractForm());
            setError(null);
            return;
        }

        if (detailQuery.data) {
            setForm(employmentcontractToFormDto(detailQuery.data));
            setError(null);
        }
    }, [isEditing, detailQuery.data]);
    useTrackedCrudFormDirty({
        form,
        isEditing,
        detailData: detailQuery.data,
        toFormDto: employmentcontractToFormDto,
        getEmptyForm: () => emptyEmploymentContractForm(),
    });


    const saveMutation = useMutation({
        mutationFn: async (dto: EmploymentContractCreateDto) => {
            const payload = {
                ...dto,
                baseSalary: dto.baseSalary ? Number(dto.baseSalary) : undefined,
            };
            if (isEditing && editingId)
                return employmentcontractService.update(editingId, payload as EmploymentContractCreateDto);
            return employmentcontractService.create(payload as EmploymentContractCreateDto);
        },
        onSuccess: async (saved) => {
            await queryClient.invalidateQueries({ queryKey: employmentcontractKeys.all });
            if (editingId) await queryClient.invalidateQueries({ queryKey: employmentcontractKeys.detail(editingId) });
            toast.success(isEditing ? "Contrato atualizado" : "Contrato cadastrado");
            void showSavedRecord(saved.id, saved);
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, { fallbackMessage: CONTRACT_CLIENT_MESSAGES.CONTRACT_SAVE_FAILED });
            setError(ex.displayMessage);
        },
    });
    const update = <K extends keyof EmploymentContractCreateDto>(field: K, value: EmploymentContractCreateDto[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };
    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        saveMutation.mutate(form);
    };

    if (isEditing && detailQuery.isLoading) {
        return (
            <SkeletonStack count={4} padded />
        );
    }

    if (isEditing && detailQuery.isError) {
        return (
            <div className="p-5">
                <p className="text-sm font-medium text-error">
                    {ExceptionCapture.displayMessage(detailQuery.error, CONTRACT_CLIENT_MESSAGES.CONTRACT_LOAD_FAILED)}
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
            footer={<CrudFormFooterActions isSubmitting={saveMutation.isPending} />}
        >
            <FormSection id="cadastro" title="Contrato">
                <div className="sm:col-span-12">
                    <CollaboratorPickerField
                        value={form.collaboratorId ?? ""}
                        onValueChange={(v) => update("collaboratorId", v)}
                        required
                    />
                </div>
                <InputSelect
                    label="Tipo de contrato"
                    items={CONTRACT_TYPE_ITEMS}
                    value={form.contractType ?? ""}
                    onValueChange={(v) =>
                        update("contractType", (v || undefined) as EmploymentContractCreateDto["contractType"])
                    }
                    placeholder="Selecione"
                    clearable
                    wrapperClassName="sm:col-span-6"
                />
                <InputCurrency
                    label="Salário base"
                    value={form.baseSalary ?? ""}
                    onValueChange={(v) => update("baseSalary", v)}
                    emitAsDecimal
                    wrapperClassName="sm:col-span-6"
                />
                <InputDate
                    label="Data de início"
                    value={form.startDate ?? ""}
                    onValueChange={(v) => update("startDate", v)}
                    required
                    wrapperClassName="sm:col-span-6"
                />
                <InputDate
                    label="Data de fim"
                    value={form.endDate ?? ""}
                    onValueChange={(v) => update("endDate", v)}
                    wrapperClassName="sm:col-span-6"
                />
            </FormSection>
            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
