"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { CLIENT_SUBSCRIPTION_TABLE_COLUMNS } from "@/modules/clientsubscription/config/clientsubscription.table-columns";
import { clientSubscriptionKeys } from "@/modules/clientsubscription/clientsubscription.query";
import type { ClientSubscription } from "@/modules/clientsubscription/dto/clientsubscription.dto";
import { CLIENT_SUBSCRIPTION_CLIENT_MESSAGES } from "@/modules/clientsubscription/exceptions/clientsubscription.messages";
import { clientSubscriptionService } from "@/modules/clientsubscription/services/clientsubscription.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { Button } from "@/shared/components/ui/Button";
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

    return (
        <QueryTablePanel<ClientSubscription>
            queryKey={clientSubscriptionKeys.all}
            request={() => clientSubscriptionService.getAll()}
            columns={CLIENT_SUBSCRIPTION_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhuma assinatura cadastrada."
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
