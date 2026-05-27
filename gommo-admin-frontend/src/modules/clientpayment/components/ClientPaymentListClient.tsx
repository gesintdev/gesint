"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CLIENT_PAYMENT_TABLE_COLUMNS } from "@/modules/clientpayment/config/clientpayment.table-columns";
import { clientPaymentKeys } from "@/modules/clientpayment/clientpayment.query";
import type { ClientPayment } from "@/modules/clientpayment/dto/clientpayment.dto";
import { CLIENT_PAYMENT_CLIENT_MESSAGES } from "@/modules/clientpayment/exceptions/clientpayment.messages";
import { clientPaymentService } from "@/modules/clientpayment/services/clientpayment.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { Button } from "@/shared/components/ui/Button";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

export function ClientPaymentListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: (id: string) => clientPaymentService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: clientPaymentKeys.all });
            toast.success("Pagamento excluído");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: CLIENT_PAYMENT_CLIENT_MESSAGES.LOAD_FAILED }),
    });

    return (
        <QueryTablePanel<ClientPayment>
            queryKey={clientPaymentKeys.all}
            request={() => clientPaymentService.getAll()}
            columns={CLIENT_PAYMENT_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhum pagamento cadastrado."
            onRowActivate={(row) => startEdit(row.id, row)}
            renderActions={(row) => (
                <>
                    <Button
                        variant="ghost"
                        size="sm"
                        aria-label="Editar"
                        leftIcon={<Pencil className="size-3.5" />}
                        onClick={() => startEdit(row.id, row)}
                    />
                    <Button
                        variant="ghost"
                        size="sm"
                        aria-label="Excluir"
                        className="text-error hover:bg-error/10"
                        leftIcon={<Trash2 className="size-3.5" />}
                        onClick={async () => {
                            if (await SystemAlert.confirmDelete()) deleteMutation.mutate(row.id);
                        }}
                    />
                </>
            )}
        />
    );
}
