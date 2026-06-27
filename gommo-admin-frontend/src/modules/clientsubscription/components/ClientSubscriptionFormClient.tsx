"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type SubmitEvent, useEffect, useState } from "react";
import { toast } from "sonner";

import { clientKeys } from "@/modules/client/client.query";
import { clientService } from "@/modules/client/services/client.service";
import { clientSubscriptionKeys } from "@/modules/clientsubscription/clientsubscription.query";
import type { ClientSubscriptionCreateDto } from "@/modules/clientsubscription/dto/clientsubscription.dto";
import { CLIENT_SUBSCRIPTION_CLIENT_MESSAGES } from "@/modules/clientsubscription/exceptions/clientsubscription.messages";
import {
    clientSubscriptionToFormDto,
    emptyClientSubscriptionForm,
} from "@/modules/clientsubscription/lib/clientsubscription.mapper";
import { clientSubscriptionService } from "@/modules/clientsubscription/services/clientsubscription.service";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { EntityCodeField } from "@/shared/components/crud/EntityCodeField";
import { Button } from "@/shared/components/ui/Button";
import { InputCurrency, InputDate, InputSelect, InputString } from "@/shared/components/ui/input/index";
import { ExceptionCapture } from "@/shared/exceptions";
import { useSyncWorkspaceTabTitle } from "@/shared/workspace/useSyncWorkspaceTabTitle";

export function ClientSubscriptionFormClient() {
    const { editingId, isEditing, goToList } = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<ClientSubscriptionCreateDto>(emptyClientSubscriptionForm());
    const [error, setError] = useState<string | null>(null);
    const clientsQuery = useQuery({ queryKey: clientKeys.all, queryFn: () => clientService.getAll() });
    const detailQuery = useQuery({
        queryKey: clientSubscriptionKeys.detail(editingId ?? ""),
        queryFn: () => clientSubscriptionService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });

    useSyncWorkspaceTabTitle(detailQuery.data ?? null);

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyClientSubscriptionForm());
            return;
        }

        if (detailQuery.data) setForm(clientSubscriptionToFormDto(detailQuery.data));
    }, [isEditing, detailQuery.data]);

    const saveMutation = useMutation({
        mutationFn: async (dto: ClientSubscriptionCreateDto) => {
            const payload = {
                ...dto,
                startedAt: dto.startedAt || undefined,
                endsAt: dto.endsAt || undefined,
            };
            if (isEditing && editingId) return clientSubscriptionService.update(editingId, payload);
            return clientSubscriptionService.create(payload);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: clientSubscriptionKeys.all });
            toast.success(isEditing ? "Assinatura atualizada" : "Assinatura cadastrada");
            goToList();
        },
        onError: (err: unknown) => {
            setError(
                ExceptionCapture.handle(err, { fallbackMessage: CLIENT_SUBSCRIPTION_CLIENT_MESSAGES.SAVE_FAILED })
                    .displayMessage,
            );
        },
    });
    const clientOptions = (clientsQuery.data ?? []).map((c) => ({ value: c.id, label: c.name }));
    const billingItems = [
        { value: "ACTIVE", label: "Ativa" },
        { value: "SUSPENDED", label: "Suspensa" },
        { value: "CANCELLED", label: "Cancelada" },
    ];
    const planItems = [
        { value: "STARTER", label: "Starter" },
        { value: "PRO", label: "Pro" },
        { value: "ENTERPRISE", label: "Enterprise" },
    ];
    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        saveMutation.mutate(form);
    };

    return (
        <CrudFormShell
            title={isEditing ? "Editar assinatura" : "Nova assinatura"}
            error={error}
            onSubmit={handleSubmit}
            footer={
                <>
                    <Button type="button" variant="ghost" onClick={goToList}>
                        Cancelar
                    </Button>
                    <Button type="submit" loading={saveMutation.isPending}>
                        Salvar
                    </Button>
                </>
            }
        >
            <div className="grid gap-4">
                <EntityCodeField code={isEditing ? detailQuery.data?.code : undefined} />
                <InputSelect
                    label="Cliente"
                    value={form.clientId}
                    onValueChange={(v) => setForm((p) => ({ ...p, clientId: v }))}
                    items={clientOptions}
                    required
                />
                <InputSelect
                    label="Plano"
                    value={form.planCode}
                    onValueChange={(v) => setForm((p) => ({ ...p, planCode: v }))}
                    items={planItems}
                    required
                />
                <InputSelect
                    label="Status de cobrança"
                    value={form.billingStatus}
                    onValueChange={(v) => setForm((p) => ({ ...p, billingStatus: v }))}
                    items={billingItems}
                    required
                />
                <InputCurrency
                    label="Valor mensal"
                    value={form.monthlyAmount ?? ""}
                    onValueChange={(v) => setForm((p) => ({ ...p, monthlyAmount: v }))}
                    emitAsDecimal
                />
                <InputDate
                    label="Início do contrato"
                    value={form.startedAt ?? ""}
                    onValueChange={(v) => setForm((p) => ({ ...p, startedAt: v }))}
                />
                <InputDate
                    label="Fim do contrato"
                    value={form.endsAt ?? ""}
                    onValueChange={(v) => setForm((p) => ({ ...p, endsAt: v }))}
                />
                <InputString
                    label="Observações"
                    value={form.notes ?? ""}
                    onValueChange={(v) => setForm((p) => ({ ...p, notes: v }))}
                />
            </div>
        </CrudFormShell>
    );
}
