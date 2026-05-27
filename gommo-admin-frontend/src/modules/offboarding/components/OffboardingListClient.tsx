"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { OFFBOARDING_CLIENT_MESSAGES } from "@/modules/offboarding/exceptions/offboarding.messages";
import { OFFBOARDING_TABLE_COLUMNS } from "@/modules/offboarding/config/offboarding.table-columns";
import type { Offboarding } from "@/modules/offboarding/dto/offboarding.dto";
import { offboardingKeys } from "@/modules/offboarding/offboarding.query";
import { offboardingService } from "@/modules/offboarding/services/offboarding.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { OpenInWorkspaceTabButton } from "@/shared/components/workspace/OpenInWorkspaceTabButton";
import { Button } from "@/shared/components/ui/Button";
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
                <>
                    <OpenInWorkspaceTabButton row={row} />
                    <Button variant="ghost" size="sm" leftIcon={<Pencil className="size-3.5" />} onClick={() => startEdit(row.id, row)} />
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-error hover:bg-error/10"
                        leftIcon={<Trash2 className="size-3.5" />}
                        loading={deleteMutation.isPending && deleteMutation.variables === row.id}
                        onClick={() => void handleDelete(row)}
                    />
                </>
            )}
        />
    );
}
