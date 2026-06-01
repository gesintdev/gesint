"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { OFFBOARDING_CLIENT_MESSAGES } from "@/modules/offboarding/exceptions/offboarding.messages";
import { OFFBOARDING_TABLE_COLUMNS } from "@/modules/offboarding/config/offboarding.table-columns";
import type { Offboarding } from "@/modules/offboarding/dto/offboarding.dto";
import { offboardingKeys } from "@/modules/offboarding/offboarding.query";
import { offboardingService } from "@/modules/offboarding/services/offboarding.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

export function OffboardingListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: (id: string) => offboardingService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: offboardingKeys.all });
            toast.success("Desligamento excluído");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: OFFBOARDING_CLIENT_MESSAGES.OFFBOARDING_LOAD_FAILED }),
    });

    const handleDelete = async (row: Offboarding) => {
        if (!(await SystemAlert.confirmDelete("Deseja excluir este desligamento? Esta ação não pode ser desfeita."))) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <QueryTablePanel<Offboarding>
            queryKey={offboardingKeys.all}
            request={() => offboardingService.getAll()}
            columns={OFFBOARDING_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhum desligamento cadastrado."
            onRowActivate={(row) => startEdit(row.id, row)}
            renderActions={(row) => (
                <CrudTableActions
                    row={row}
                    onEdit={() => startEdit(row.id, row)}
                    onDelete={() => void handleDelete(row)}
                    deleteLoading={deleteMutation.isPending && deleteMutation.variables === row.id}
                />
            )}
        />
    );
}
