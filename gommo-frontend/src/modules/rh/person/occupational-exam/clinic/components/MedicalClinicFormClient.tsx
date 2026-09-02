"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import type { MedicalClinicCreateDto } from "@/modules/rh/person/occupational-exam/clinic/dto/medical-clinic.dto";
import {
    emptyMedicalClinicForm,
    medicalClinicToFormDto,
    medicalClinicToRequestDto,
} from "@/modules/rh/person/occupational-exam/clinic/lib/medical-clinic.mapper";
import { medicalClinicKeys } from "@/modules/rh/person/occupational-exam/clinic/medical-clinic.query";
import { medicalClinicService } from "@/modules/rh/person/occupational-exam/clinic/services/medical-clinic.service";
import { OCCUPATIONAL_EXAM_CLIENT_MESSAGES } from "@/modules/rh/person/occupational-exam/exceptions/occupational-exam.messages";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { useTrackedCrudFormDirty } from "@/shared/components/crud/useTrackedCrudFormDirty";
import { Button } from "@/shared/components/ui/Button";
import { FormSection } from "@/shared/components/ui/FormSection";
import { type FormStepNavItem } from "@/shared/components/ui/FormStepper";
import { InputCNPJ, InputDate, InputPhone, InputString } from "@/shared/components/ui/input/index";
import { ExceptionCapture } from "@/shared/exceptions";
import { isValidCnpj } from "@/shared/lib/input/cnpj";

const FORM_STEPS: FormStepNavItem[] = [{ id: "dados", label: "Clinica" }];

export function MedicalClinicFormClient() {
    const { editingId, isEditing, goToList, returnToList } = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<MedicalClinicCreateDto>(emptyMedicalClinicForm);
    const [error, setError] = useState<string | null>(null);

    const detailQuery = useQuery({
        queryKey: medicalClinicKeys.detail(editingId ?? ""),
        queryFn: () => medicalClinicService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyMedicalClinicForm());
            setError(null);
            return;
        }
        if (detailQuery.data) {
            setForm(medicalClinicToFormDto(detailQuery.data));
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
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: medicalClinicKeys.all });
            if (editingId) {
                await queryClient.invalidateQueries({ queryKey: medicalClinicKeys.detail(editingId) });
            }
            toast.success(isEditing ? "Clinica atualizada" : "Clinica cadastrada");
            setForm(emptyMedicalClinicForm());
            returnToList();
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
                entityCode: isEditing ? detailQuery.data?.code : undefined,
                resetKey: editingId ?? "new",
            }}
            footer={
                <>
                    <Button type="button" variant="ghost" onClick={goToList}>
                        Cancelar
                    </Button>
                    <Button type="submit" loading={saveMutation.isPending}>
                        {isEditing ? "Salvar" : "Cadastrar"}
                    </Button>
                </>
            }
        >
            <FormSection id="dados" title="Dados da clinica" description="Cadastro da clinica credenciada para exames.">
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
                <InputString
                    label="Endereco"
                    value={form.address ?? ""}
                    onValueChange={(v) => update("address", v)}
                    wrapperClassName="sm:col-span-12"
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
            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
