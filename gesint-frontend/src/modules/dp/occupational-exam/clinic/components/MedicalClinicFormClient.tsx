"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import type { MedicalClinicCreateDto } from "@/modules/dp/occupational-exam/clinic/dto/medical-clinic.dto";
import {
    emptyMedicalClinicForm,
    medicalClinicToFormDto,
    medicalClinicToRequestDto,
} from "@/modules/dp/occupational-exam/clinic/lib/medical-clinic.mapper";
import { medicalClinicKeys } from "@/modules/dp/occupational-exam/clinic/medical-clinic.query";
import { medicalClinicService } from "@/modules/dp/occupational-exam/clinic/services/medical-clinic.service";
import { OCCUPATIONAL_EXAM_CLIENT_MESSAGES } from "@/modules/dp/occupational-exam/exceptions/occupational-exam.messages";
import { CrudFormFooterActions } from "@/shared/components/crud/CrudFormFooterActions";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { useTrackedCrudFormDirty } from "@/shared/components/crud/useTrackedCrudFormDirty";
import { AddressFormSection } from "@/shared/components/form/AddressFormSection";
import { Button } from "@/shared/components/ui/Button";
import { FormSection } from "@/shared/components/ui/FormSection";
import { type FormStepNavItem } from "@/shared/components/ui/FormStepper";
import { InputCNPJ, InputDate, InputPhone, InputString } from "@/shared/components/ui/input/index";
import { SkeletonStack } from "@/shared/components/ui/SkeletonStack";
import { ExceptionCapture } from "@/shared/exceptions";
import { isStepFilled } from "@/shared/lib/form-step.util";
import { isValidCnpj } from "@/shared/lib/input/cnpj";

const FORM_STEPS: FormStepNavItem[] = [
    { id: "dados", label: "Clínica" },
    { id: "endereco", label: "Endereço" },
];

export function MedicalClinicFormClient() {
    const { editingId, isEditing, goToList, showSavedRecord } = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<MedicalClinicCreateDto>(emptyMedicalClinicForm);
    const [stateLabel, setStateLabel] = useState("");
    const [cityLabel, setCityLabel] = useState("");
    const [error, setError] = useState<string | null>(null);

    const detailQuery = useQuery({
        queryKey: medicalClinicKeys.detail(editingId ?? ""),
        queryFn: () => medicalClinicService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyMedicalClinicForm());
            setStateLabel("");
            setCityLabel("");
            setError(null);
            return;
        }
        if (detailQuery.data) {
            setForm(medicalClinicToFormDto(detailQuery.data));
            setStateLabel(detailQuery.data.stateCode ?? "");
            setCityLabel(detailQuery.data.cityName ?? "");
            setError(null);
        }
    }, [isEditing, detailQuery.data]);
    useTrackedCrudFormDirty({
        form,
        isEditing,
        detailData: detailQuery.data,
        toFormDto: medicalClinicToFormDto,
        getEmptyForm: () => emptyMedicalClinicForm(),
    });


    const saveMutation = useMutation({
        mutationFn: async (dto: MedicalClinicCreateDto) => {
            const payload = medicalClinicToRequestDto(dto);
            if (isEditing && editingId) return medicalClinicService.update(editingId, payload);
            return medicalClinicService.create(payload);
        },
        onSuccess: async (saved) => {
            await queryClient.invalidateQueries({ queryKey: medicalClinicKeys.all });
            if (editingId) {
                await queryClient.invalidateQueries({ queryKey: medicalClinicKeys.detail(editingId) });
            }
            toast.success(isEditing ? "Clinica atualizada" : "Clinica cadastrada");
            void showSavedRecord(saved.id, saved);
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: OCCUPATIONAL_EXAM_CLIENT_MESSAGES.CLINIC_SAVE_FAILED,
            });
            setError(ex.displayMessage);
        },
    });

    const update = <K extends keyof MedicalClinicCreateDto>(field: K, value: MedicalClinicCreateDto[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        if (!form.corporateName.trim()) {
            setError("Informe a razao social.");
            return;
        }
        if (!isValidCnpj(form.cnpj)) {
            setError("Informe um CNPJ valido.");
            return;
        }
        saveMutation.mutate(form);
    };
    const filledStepIds = useMemo(() => {
        const filled: string[] = [];
        if (isStepFilled([{ value: form.corporateName }, { value: form.cnpj }])) filled.push("dados");
        if (
            isStepFilled([
                { value: form.zipCode },
                { value: form.stateId },
                { value: form.street },
                { value: form.number },
                { value: form.cityId },
            ])
        ) {
            filled.push("endereco");
        }
        return filled;
    }, [form]);

    if (isEditing && detailQuery.isLoading) {
        return (
            <SkeletonStack count={4} padded />
        );
    }

    if (isEditing && detailQuery.isError) {
        return (
            <div className="p-5">
                <p className="text-sm font-medium text-error">
                    {ExceptionCapture.displayMessage(
                        detailQuery.error,
                        OCCUPATIONAL_EXAM_CLIENT_MESSAGES.CLINIC_LOAD_FAILED,
                    )}
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
                filledStepIds,
                entityCode: isEditing ? detailQuery.data?.code : undefined,
                resetKey: editingId ?? "new",
            }}
            footer={<CrudFormFooterActions isSubmitting={saveMutation.isPending} />}
        >
            <FormSection id="dados" title="Dados da clínica" description="Cadastro da clínica credenciada para exames.">
                <InputString
                    label="Razao social"
                    value={form.corporateName}
                    onValueChange={(v) => update("corporateName", v)}
                    required
                    wrapperClassName="sm:col-span-8"
                />
                <InputCNPJ
                    label="CNPJ"
                    value={form.cnpj}
                    onValueChange={(v) => update("cnpj", v)}
                    required
                    wrapperClassName="sm:col-span-4"
                />
                <InputPhone
                    label="Telefone"
                    value={form.phone ?? ""}
                    onValueChange={(v) => update("phone", v)}
                    wrapperClassName="sm:col-span-4"
                />
                <InputString
                    label="E-mail"
                    value={form.email ?? ""}
                    onValueChange={(v) => update("email", v)}
                    wrapperClassName="sm:col-span-4"
                />
                <InputDate
                    label="Credenciamento valido ate"
                    value={form.accreditationValidUntil ?? ""}
                    onValueChange={(v) => update("accreditationValidUntil", v)}
                    wrapperClassName="sm:col-span-4"
                />
                <InputString
                    label="Exames oferecidos"
                    value={form.examsOffered ?? ""}
                    onValueChange={(v) => update("examsOffered", v)}
                    wrapperClassName="sm:col-span-12"
                />
            </FormSection>
            <AddressFormSection
                id="endereco"
                value={{
                    zipCode: form.zipCode,
                    stateId: form.stateId,
                    cityId: form.cityId,
                    street: form.street,
                    number: form.number,
                    district: form.district,
                    complement: form.complement,
                }}
                stateLabel={stateLabel}
                cityLabel={cityLabel}
                disabled={saveMutation.isPending}
                onChange={(address, labels) => {
                    setStateLabel(labels.stateLabel);
                    setCityLabel(labels.cityLabel);
                    setForm((prev) => ({ ...prev, ...address }));
                }}
            />
            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
