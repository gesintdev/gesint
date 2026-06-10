"use client";
import { useEffect, useState, type SubmitEvent } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { OffboardingCreateDto } from "@/modules/offboarding/dto/offboarding.dto";
import { OFFBOARDING_CLIENT_MESSAGES } from "@/modules/offboarding/exceptions/offboarding.messages";
import { emptyOffboardingForm, offboardingToFormDto } from "@/modules/offboarding/lib/offboarding.mapper";
import { offboardingKeys } from "@/modules/offboarding/offboarding.query";
import { offboardingService } from "@/modules/offboarding/services/offboarding.service";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { EntityCodeField } from "@/shared/components/crud/EntityCodeField";
import { EntityAttachments } from "@/shared/components/storage/EntityAttachments";
import { Button } from "@/shared/components/ui/Button";
import { InputDate, InputSelect, InputString } from "@/shared/components/ui/input/index";
import { ExceptionCapture } from "@/shared/exceptions";

const DISMISSAL_ITEMS = [
    { value: "WITHOUT_CAUSE", label: "Sem justa causa" },
    { value: "WITH_CAUSE", label: "Com justa causa" },
    { value: "RESIGNATION", label: "Pedido de demissão" },
    { value: "AGREEMENT", label: "Acordo" },
    { value: "END_OF_CONTRACT", label: "Fim de contrato" },
    { value: "OTHER", label: "Outro" },
];

export function OffboardingFormClient() {
    const { editingId, isEditing, goToList, startEdit } = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<OffboardingCreateDto>(emptyOffboardingForm);
    const [error, setError] = useState<string | null>(null);
    const detailQuery = useQuery({
        queryKey: offboardingKeys.detail(editingId ?? ""),
        queryFn: () => offboardingService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
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
    }, [isEditing, detailQuery.data]);

    const saveMutation = useMutation({
        mutationFn: async (dto: OffboardingCreateDto) => {
            if (isEditing && editingId) return offboardingService.update(editingId, dto);
            return offboardingService.create(dto);
        },
        onSuccess: async (result) => {
            await queryClient.invalidateQueries({ queryKey: offboardingKeys.all });
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

    if (isEditing && detailQuery.isLoading) {
        return (
            <div className="gommo-crud-panel-inset grid gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton-shimmer h-10 w-full" />
                ))}
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
                    <Button type="submit" loading={saveMutation.isPending}>
                        {isEditing ? "Salvar" : "Cadastrar"}
                    </Button>
                </>
            }
        >
            <div className="flex flex-col gap-6">
                <div className="grid gap-3 sm:grid-cols-2">
                    <div className="sm:col-span-2">
                        <p className="text-sm font-semibold text-base-content">
                            {isEditing ? "Editar desligamento" : "Novo desligamento"}
                        </p>
                    </div>
                    <EntityCodeField code={isEditing ? detailQuery.data?.code : undefined} />
                    <InputString
                        label="Colaborador ID"
                        value={form.collaboratorId}
                        onValueChange={(v) => update("collaboratorId", v)}
                        required
                    />
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
                    {error && <p className="text-sm font-medium text-error sm:col-span-2">{error}</p>}
                </div>
                <div className="rounded-lg border border-[var(--gommo-border-subtle)] p-4">
                    <p className="mb-3 text-sm font-semibold text-base-content">Documentos</p>
                    <EntityAttachments entityType="offboarding" entityId={editingId} />
                </div>
            </div>
        </CrudFormShell>
    );
}
