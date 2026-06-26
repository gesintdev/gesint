"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { clientPaymentKeys } from "@/modules/clientpayment/clientpayment.query";
import { CLIENT_PAYMENT_TABLE_COLUMNS } from "@/modules/clientpayment/config/clientpayment.table-columns";
import type { ClientPayment } from "@/modules/clientpayment/dto/clientpayment.dto";
import { CLIENT_PAYMENT_CLIENT_MESSAGES } from "@/modules/clientpayment/exceptions/clientpayment.messages";
import { clientPaymentService } from "@/modules/clientpayment/services/clientpayment.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
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
    const handleDelete = async (row: ClientPayment) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <QueryTablePanel<ClientPayment>
            queryKey={clientPaymentKeys.all}
            request={() => clientPaymentService.getAll()}
            columns={CLIENT_PAYMENT_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhum pagamento cadastrado."
            onRowActivate={(row) => startEdit(row.id, row)}
            renderActions={(row) => (
                <CrudTableActions
                    row={row}
                    showOpenTab={false}
                    onEdit={() => startEdit(row.id, row)}
                    onDelete={() => void handleDelete(row)}
                    deleteLoading={deleteMutation.isPending && deleteMutation.variables === row.id}
                />
            )}
        />
    );
}
