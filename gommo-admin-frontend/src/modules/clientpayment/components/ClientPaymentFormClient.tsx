"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { type SubmitEvent,useEffect, useState } from "react";
import { toast } from "sonner";

import { clientKeys } from "@/modules/client/client.query";
import { clientService } from "@/modules/client/services/client.service";
import { clientPaymentKeys } from "@/modules/clientpayment/clientpayment.query";
import type { ClientPaymentCreateDto } from "@/modules/clientpayment/dto/clientpayment.dto";
import { CLIENT_PAYMENT_CLIENT_MESSAGES } from "@/modules/clientpayment/exceptions/clientpayment.messages";
import { clientPaymentToFormDto, emptyClientPaymentForm } from "@/modules/clientpayment/lib/clientpayment.mapper";
import { clientPaymentService } from "@/modules/clientpayment/services/clientpayment.service";
import { CrudFormShell } from "@/shared/components/crud/CrudFormShell";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { EntityCodeField } from "@/shared/components/crud/EntityCodeField";
import { Button } from "@/shared/components/ui/Button";
import { InputCurrency, InputDate, InputSelect, InputString } from "@/shared/components/ui/input/index";
import { ExceptionCapture } from "@/shared/exceptions";
import { useSyncWorkspaceTabTitle } from "@/shared/workspace/useSyncWorkspaceTabTitle";

export function ClientPaymentFormClient() {
    const { editingId, isEditing, goToList } = useCrudScreen();
    const queryClient = useQueryClient();
    const [form, setForm] = useState<ClientPaymentCreateDto>(emptyClientPaymentForm());
    const [error, setError] = useState<string | null>(null);
    const clientsQuery = useQuery({ queryKey: clientKeys.all, queryFn: () => clientService.getAll() });
    const detailQuery = useQuery({
        queryKey: clientPaymentKeys.detail(editingId ?? ""),
        queryFn: () => clientPaymentService.getById(editingId!),
        enabled: isEditing && Boolean(editingId),
    });

    useSyncWorkspaceTabTitle(detailQuery.data ?? null);

    useEffect(() => {
        if (!isEditing) {
            setForm(emptyClientPaymentForm());
            return;
        }

        if (detailQuery.data) setForm(clientPaymentToFormDto(detailQuery.data));
    }, [isEditing, detailQuery.data]);

    const saveMutation = useMutation({
        mutationFn: async (dto: ClientPaymentCreateDto) => {
            const payload = {
                ...dto,
                paidAt: dto.paidAt ? `${dto.paidAt}T12:00:00-03:00` : undefined,
            };
            if (isEditing && editingId) return clientPaymentService.update(editingId, payload);
            return clientPaymentService.create(payload);
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: clientPaymentKeys.all });
            toast.success(isEditing ? "Pagamento atualizado" : "Pagamento cadastrado");
            goToList();
        },
        onError: (err: unknown) => {
            setError(
                ExceptionCapture.handle(err, { fallbackMessage: CLIENT_PAYMENT_CLIENT_MESSAGES.SAVE_FAILED })
                    .displayMessage,
            );
        },
    });
    const clientOptions = (clientsQuery.data ?? []).map((c) => ({ value: c.id, label: c.name }));
    const paymentStatusItems = [
        { value: "PENDING", label: "Pendente" },
        { value: "PAID", label: "Pago" },
        { value: "OVERDUE", label: "Em atraso" },
        { value: "CANCELLED", label: "Cancelado" },
    ];
    const handleSubmit = (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault();
        setError(null);
        saveMutation.mutate(form);
    };

    return (
        <CrudFormShell
            title={isEditing ? "Editar pagamento" : "Novo pagamento"}
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
                <InputString
                    label="Referência"
                    value={form.referenceCode ?? ""}
                    onValueChange={(v) => setForm((p) => ({ ...p, referenceCode: v }))}
                />
                <InputCurrency
                    label="Valor"
                    value={form.amount ?? ""}
                    onValueChange={(v) => setForm((p) => ({ ...p, amount: v ?? "" }))}
                    emitAsDecimal
                    required
                />
                <InputDate
                    label="Vencimento"
                    value={form.dueDate ?? ""}
                    onValueChange={(v) => setForm((p) => ({ ...p, dueDate: v }))}
                    required
                />
                <InputSelect
                    label="Status do pagamento"
                    value={form.paymentStatus}
                    onValueChange={(v) => setForm((p) => ({ ...p, paymentStatus: v }))}
                    items={paymentStatusItems}
                    required
                />
                <InputDate
                    label="Data de pagamento"
                    value={form.paidAt ?? ""}
                    onValueChange={(v) => setForm((p) => ({ ...p, paidAt: v }))}
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
