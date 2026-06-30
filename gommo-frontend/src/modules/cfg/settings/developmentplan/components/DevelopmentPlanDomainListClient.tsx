"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { toast } from "sonner";

import { type DevelopmentPlanDomainConfig } from "@/modules/cfg/settings/developmentplan/config/development-plan-domain.config";
import { DevelopmentPlanDomainRecord, DevelopmentPlanDomainService } from "@/modules/cfg/settings/developmentplan/services/development-plan-domain.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

export function DevelopmentPlanDomainListClient({ config }: { config: DevelopmentPlanDomainConfig }) {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();
    const service = useMemo(() => new DevelopmentPlanDomainService(config.endpoint), [config.endpoint]);
    const queryKey = ["development-plan-domain", config.id] as const;
    const deleteMutation = useMutation({
        mutationFn: (id: string) => service.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey });
            toast.success("Registro excluído");
        },
        onError: (err: unknown) => ExceptionCapture.handle(err, { fallbackMessage: "Não foi possível excluir o registro." }),
    });
    const handleDelete = async (row: DevelopmentPlanDomainRecord) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <QueryTablePanel<DevelopmentPlanDomainRecord>
            queryKey={queryKey}
            request={() => service.getAll()}
            columns={config.columns}
            rowKey="id"
            emptyMessage={config.emptyMessage}
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