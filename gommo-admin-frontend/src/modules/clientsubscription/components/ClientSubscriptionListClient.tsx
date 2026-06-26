"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { clientSubscriptionKeys } from "@/modules/clientsubscription/clientsubscription.query";
import { CLIENT_SUBSCRIPTION_TABLE_COLUMNS } from "@/modules/clientsubscription/config/clientsubscription.table-columns";
import type { ClientSubscription } from "@/modules/clientsubscription/dto/clientsubscription.dto";
import { CLIENT_SUBSCRIPTION_CLIENT_MESSAGES } from "@/modules/clientsubscription/exceptions/clientsubscription.messages";
import { clientSubscriptionService } from "@/modules/clientsubscription/services/clientsubscription.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

export function ClientSubscriptionListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();
    const deleteMutation = useMutation({
        mutationFn: (id: string) => clientSubscriptionService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: clientSubscriptionKeys.all });
            toast.success("Assinatura excluída");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: CLIENT_SUBSCRIPTION_CLIENT_MESSAGES.LOAD_FAILED }),
    });
    const handleDelete = async (row: ClientSubscription) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <QueryTablePanel<ClientSubscription>
            queryKey={clientSubscriptionKeys.all}
            request={() => clientSubscriptionService.getAll()}
            columns={CLIENT_SUBSCRIPTION_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhuma assinatura cadastrada."
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
