"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type FormEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import { OCCUPATIONAL_EXAM_CLIENT_MESSAGES } from "@/modules/dp/occupational-exam/exceptions/occupational-exam.messages";
import { PhysicianClinicPicker } from "@/modules/dp/occupational-exam/physician/components/PhysicianClinicPicker";
import type { OccupationalPhysicianCreateDto } from "@/modules/dp/occupational-exam/physician/dto/occupational-physician.dto";
import {
    emptyOccupationalPhysicianForm,
    occupationalPhysicianToFormDto,
    occupationalPhysicianToRequestDto,
} from "@/modules/dp/occupational-exam/physician/lib/occupational-physician.mapper";
import {
    BRAZIL_UF_ITEMS,
    OCCUPATIONAL_PHYSICIAN_ROLE_ITEMS,
} from "@/modules/dp/occupational-exam/physician/lib/occupational-physician.options";
import { occupationalPhysicianKeys } from "@/modules/dp/occupational-exam/physician/occupational-physician.query";
import { occupationalPhysicianService } from "@/modules/dp/occupational-exam/physician/services/occupational-physician.service";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { useTrackedCrudFormDirty } from "@/shared/components/crud/useTrackedCrudFormDirty";
import { Button } from "@/shared/components/ui/Button";
import { SkeletonStack } from "@/shared/components/ui/SkeletonStack";
import { FormSection } from "@/shared/components/ui/FormSection";
import { type FormStepNavItem } from "@/shared/components/ui/FormStepper";
import { InputPhone, InputSelect, InputString } from "@/shared/components/ui/input/index";
import { ExceptionCapture } from "@/shared/exceptions";

const FORM_STEPS: FormStepNavItem[] = [
    { id: "dados", label: "Medico" },
    { id: "clinicas", label: "Clinicas" },
];

export function OccupationalPhysicianFormClient() {
    const { editingId, isEditing, goToList, showSavedRecord, startCreate } = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<OccupationalPhysicianCreateDto>(emptyOccupationalPhysicianForm);
    const [error, setError] = useState<string | null>(null);

    const detailQuery = useQuery({
        queryKey: occupationalPhysicianKeys.detail(editingId ?? ""),
        queryFn: () => occupationalPhysicianService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyOccupationalPhysicianForm());
            setError(null);
            return;
        }
        if (detailQuery.data) {
            setForm(occupationalPhysicianToFormDto(detailQuery.data));
            setError(null);
        }
    }, [isEditing, detailQuery.data]);

    useTrackedCrudFormDirty({
        form,
        isEditing,
        detailData: detailQuery.data,
        toFormDto: occupationalPhysicianToFormDto,
        getEmptyForm: () => emptyOccupationalPhysicianForm(),
    });

    const saveMutation = useMutation({
        mutationFn: async (dto: OccupationalPhysicianCreateDto) => {
            const payload = occupationalPhysicianToRequestDto(dto);
            if (isEditing && editingId) return occupationalPhysicianService.update(editingId, payload);
            return occupationalPhysicianService.create(payload);
        },
        onSuccess: async (saved) => {
            await queryClient.invalidateQueries({ queryKey: occupationalPhysicianKeys.all });
            if (editingId) {
                await queryClient.invalidateQueries({
                    queryKey: occupationalPhysicianKeys.detail(editingId),
                });
            }
            toast.success(isEditing ? "Medico atualizado" : "Medico cadastrado");
            void showSavedRecord(saved.id, saved);
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: OCCUPATIONAL_EXAM_CLIENT_MESSAGES.PHYSICIAN_SAVE_FAILED,
            });
            setError(ex.displayMessage);
        },
    });

    const update = <K extends keyof OccupationalPhysicianCreateDto>(
        field: K,
        value: OccupationalPhysicianCreateDto[K],
    ) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        if (!form.fullName.trim()) {
            setError("Informe o nome do medico.");
            return;
        }
        if (!form.crm.trim()) {
            setError("Informe o CRM.");
            return;
        }
        if (!form.crmState.trim() || form.crmState.trim().length !== 2) {
            setError("Informe a UF do CRM.");
            return;
        }
        if (!form.role) {
            setError("Informe o papel do medico.");
            return;
        }
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
                    {ExceptionCapture.displayMessage(
                        detailQuery.error,
                        OCCUPATIONAL_EXAM_CLIENT_MESSAGES.PHYSICIAN_LOAD_FAILED,
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
                    <Button type="button" variant="outline" onClick={startCreate}>
                        Novo cadastro
                    </Button>
                    <Button type="submit" loading={saveMutation.isPending}>
                        {isEditing ? "Salvar" : "Cadastrar"}
                    </Button>
                </>
            }
        >
            <FormSection
                id="dados"
                title="Dados do medico"
                description="CRM e UF sao obrigatorios para o eSocial S-2220."
            >
                <InputString
                    label="Nome completo"
                    value={form.fullName}
                    onValueChange={(v) => update("fullName", v)}
                    required
                    wrapperClassName="sm:col-span-8"
                />
                <InputSelect
                    label="Papel"
                    value={form.role}
                    onValueChange={(v) => update("role", v as OccupationalPhysicianCreateDto["role"])}
                    items={OCCUPATIONAL_PHYSICIAN_ROLE_ITEMS}
                    required
                    wrapperClassName="sm:col-span-4"
                />
                <InputString
                    label="CRM"
                    value={form.crm}
                    onValueChange={(v) => update("crm", v)}
                    required
                    wrapperClassName="sm:col-span-4"
                />
                <InputSelect
                    label="UF do CRM"
                    value={form.crmState}
                    onValueChange={(v) => update("crmState", v)}
                    items={BRAZIL_UF_ITEMS}
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
                    wrapperClassName="sm:col-span-8"
                />
            </FormSection>
            <FormSection
                id="clinicas"
                title="Clinicas"
                description="Selecione as clinicas em que o medico atende."
            >
                <PhysicianClinicPicker
                    selectedIds={form.clinicIds ?? []}
                    onChange={(ids) => update("clinicIds", ids)}
                    disabled={saveMutation.isPending}
                />
            </FormSection>
            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
