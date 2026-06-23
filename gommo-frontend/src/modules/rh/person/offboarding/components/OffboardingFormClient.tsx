"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type SubmitEvent,useEffect, useMemo, useState } from "react";
import { toast } from "sonner";

import { collaboratorKeys } from "@/modules/rh/person/collaborators/people/collaborator.query";
import type { OffboardingCreateDto } from "@/modules/rh/person/offboarding/dto/offboarding.dto";
import { OFFBOARDING_CLIENT_MESSAGES } from "@/modules/rh/person/offboarding/exceptions/offboarding.messages";
import { emptyOffboardingForm, offboardingToFormDto } from "@/modules/rh/person/offboarding/lib/offboarding.mapper";
import { offboardingKeys } from "@/modules/rh/person/offboarding/offboarding.query";
import { offboardingService } from "@/modules/rh/person/offboarding/services/offboarding.service";
import { storageService } from "@/modules/storage/services/storage.service";
import { CollaboratorPickerField } from "@/shared/components/crud/CollaboratorPickerField";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { EntityAttachments } from "@/shared/components/storage/EntityAttachments";
import { Button } from "@/shared/components/ui/Button";
import { FormSection } from "@/shared/components/ui/FormSection";
import { type FormStepNavItem } from "@/shared/components/ui/FormStepper";
import { InputDate, InputSelect, InputString } from "@/shared/components/ui/input/index";
import { ExceptionCapture } from "@/shared/exceptions";
import { sectionHasChanges } from "@/shared/lib/form-step.util";

const DISMISSAL_ITEMS = [
    { value: "WITHOUT_CAUSE", label: "Sem justa causa" },
    { value: "WITH_CAUSE", label: "Com justa causa" },
    { value: "RESIGNATION", label: "Pedido de demissão" },
    { value: "AGREEMENT", label: "Acordo" },
    { value: "END_OF_CONTRACT", label: "Fim de contrato" },
    { value: "OTHER", label: "Outro" },
];
const OFFBOARDING_FORM_STEPS: FormStepNavItem[] = [
    { id: "desligamento", label: "Desligamento" },
    { id: "documentos", label: "Documentos" },
];

export function OffboardingFormClient() {
    const { editingId, isEditing, goToList, startEdit } = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<OffboardingCreateDto>(emptyOffboardingForm);
    const [error, setError] = useState<string | null>(null);
    const emptyDefaults = useMemo(() => emptyOffboardingForm(), []);
    const detailQuery = useQuery({
        queryKey: offboardingKeys.detail(editingId ?? ""),
        queryFn: () => offboardingService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });
    const attachmentsQuery = useQuery({
        queryKey: ["storage-links", "offboarding", editingId],
        queryFn: () => storageService.listLinks("offboarding", editingId!),
        enabled: Boolean(editingId),
    });

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyOffboardingForm());
            setError(null);
            return;
        }

        if (detailQuery.data) {
            setForm(offboardingToFormDto(detailQuery.data));
            setError(null);
        }
    }, [isEditing, detailQuery.data, editingId]);

    const saveMutation = useMutation({
        mutationFn: async (dto: OffboardingCreateDto) => {
            if (isEditing && editingId) return offboardingService.update(editingId, dto);
            return offboardingService.create(dto);
        },
        onSuccess: async (result) => {
            await queryClient.invalidateQueries({ queryKey: offboardingKeys.all });
            await queryClient.invalidateQueries({ queryKey: collaboratorKeys.all });
            await queryClient.invalidateQueries({ queryKey: offboardingKeys.detail(result.id) });
            toast.success(isEditing ? "Desligamento atualizado" : "Desligamento cadastrado");
            startEdit(result.id);
        },
        onError: (err: unknown) => {
            const ex = ExceptionCapture.handle(err, {
                fallbackMessage: OFFBOARDING_CLIENT_MESSAGES.OFFBOARDING_SAVE_FAILED,
            });
            setError(ex.displayMessage);
        },
    });
    const update = <K extends keyof OffboardingCreateDto>(field: K, value: OffboardingCreateDto[K]) => {
        setForm((prev) => ({ ...prev, [field]: value }));
    };
    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        saveMutation.mutate(form);
    };
    const filledStepIds = useMemo(() => {
        const empty = emptyDefaults;
        const filled: string[] = [];
        if (
            sectionHasChanges(form, empty, [
                "collaboratorId",
                "dismissalDate",
                "dismissalType",
                "dismissalNotes",
                "homologationNotes",
            ])
        ) {
            filled.push("desligamento");
        }

        if ((attachmentsQuery.data?.length ?? 0) > 0) {
            filled.push("documentos");
        }
        return filled;
    }, [form, emptyDefaults, attachmentsQuery.data]);

    if (isEditing && detailQuery.isLoading) {
        return (
            <div className="grid gap-2 p-5">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton-shimmer h-10 w-full" />
                ))}
            </div>
        );
    }

    return (
        <CrudFormShell
            onSubmit={handleSubmit}
            stepper={{
                steps: OFFBOARDING_FORM_STEPS,
                filledStepIds,
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
            <FormSection
                id="desligamento"
                title="Desligamento"
                description="Colaborador, data e motivo do desligamento."
            >
                <div className="sm:col-span-2">
                    <CollaboratorPickerField
                        value={form.collaboratorId}
                        onValueChange={(v) => update("collaboratorId", v)}
                        required
                    />
                </div>
                <InputDate
                    label="Data do desligamento"
                    value={form.dismissalDate}
                    onValueChange={(v) => update("dismissalDate", v)}
                    required
                />
                <InputSelect
                    label="Tipo de desligamento"
                    items={DISMISSAL_ITEMS}
                    value={form.dismissalType ?? ""}
                    onValueChange={(v) =>
                        update("dismissalType", (v || undefined) as OffboardingCreateDto["dismissalType"])
                    }
                    placeholder="Selecione"
                    clearable
                />
                <InputString
                    label="Observações do desligamento"
                    value={form.dismissalNotes ?? ""}
                    onValueChange={(v) => update("dismissalNotes", v)}
                    wrapperClassName="sm:col-span-2"
                />
                <InputString
                    label="Observações da homologação"
                    value={form.homologationNotes ?? ""}
                    onValueChange={(v) => update("homologationNotes", v)}
                    wrapperClassName="sm:col-span-2"
                />
            </FormSection>
            <FormSection
                id="documentos"
                title="Documentos"
                description="Anexos vinculados ao desligamento."
                bodyClassName="!block"
            >
                <EntityAttachments entityType="offboarding" entityId={editingId} />
            </FormSection>
            {error ? <p className="text-sm font-medium text-error">{error}</p> : null}
        </CrudFormShell>
    );
}
