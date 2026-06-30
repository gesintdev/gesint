"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Send, X } from "lucide-react";
import { toast } from "sonner";

import { DEVELOPMENT_PLAN_TABLE_COLUMNS } from "@/modules/rh/person/developmentplan/config/development-plan.table-columns";
import { developmentPlanKeys } from "@/modules/rh/person/developmentplan/development-plan.query";
import type { DevelopmentPlan } from "@/modules/rh/person/developmentplan/dto/development-plan.dto";
import { developmentPlanService } from "@/modules/rh/person/developmentplan/services/development-plan.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { Button } from "@/shared/components/ui/Button";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

export function DevelopmentPlanListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();
    const invalidate = async () => queryClient.invalidateQueries({ queryKey: developmentPlanKeys.all });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => developmentPlanService.remove(id),
        onSuccess: async () => {
            await invalidate();
            toast.success("PDI excluído");
        },
        onError: (err: unknown) => ExceptionCapture.handle(err, { fallbackMessage: "Não foi possível excluir o PDI." }),
    });
    const flowMutation = useMutation({
        mutationFn: ({ id, action }: { id: string; action: "submit" | "approve" | "conclude" | "cancel" }) => {
            if (action === "submit") return developmentPlanService.submitForApproval(id);
            if (action === "approve") return developmentPlanService.approve(id);
            if (action === "conclude") return developmentPlanService.conclude(id);
            return developmentPlanService.cancel(id, "Cancelado pela tela de PDI");
        },
        onSuccess: async () => {
            await invalidate();
            toast.success("Status do PDI atualizado");
        },
        onError: (err: unknown) => ExceptionCapture.handle(err, { fallbackMessage: "Não foi possível atualizar o status do PDI." }),
    });

    const handleDelete = async (row: DevelopmentPlan) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    const flow = async (row: DevelopmentPlan, action: "submit" | "approve" | "conclude" | "cancel") => {
        if (action === "cancel") {
            const ok = await SystemAlert.confirm({
                title: "Cancelar PDI",
                message: "Deseja cancelar este PDI?",
                confirmLabel: "Cancelar PDI",
                cancelLabel: "Voltar",
                destructive: true,
            });
            if (!ok) return;
        }
        flowMutation.mutate({ id: row.id, action });
    };

    return (
        <QueryTablePanel<DevelopmentPlan>
            queryKey={developmentPlanKeys.all}
            request={() => developmentPlanService.getAll()}
            columns={DEVELOPMENT_PLAN_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhum PDI cadastrado."
            onRowActivate={(row) => startEdit(row.id, row)}
            renderActions={(row) => (
                <div className="flex items-center justify-end gap-1">
                    {row.planStatus === "DRAFT" ? (
                        <Button type="button" variant="ghost" size="sm" leftIcon={<Send className="size-3.5" />} onClick={() => void flow(row, "submit")}>
                            Enviar
                        </Button>
                    ) : null}
                    {row.planStatus === "PENDING_APPROVAL" ? (
                        <Button type="button" variant="ghost" size="sm" leftIcon={<Check className="size-3.5" />} onClick={() => void flow(row, "approve")}>
                            Aprovar
                        </Button>
                    ) : null}
                    {row.progress === 100 && row.planStatus !== "COMPLETED" ? (
                        <Button type="button" variant="ghost" size="sm" leftIcon={<Check className="size-3.5" />} onClick={() => void flow(row, "conclude")}>
                            Concluir
                        </Button>
                    ) : null}
                    {row.planStatus !== "COMPLETED" && row.planStatus !== "CANCELED" ? (
                        <Button type="button" variant="ghost" size="sm" leftIcon={<X className="size-3.5" />} onClick={() => void flow(row, "cancel")}>
                            Cancelar
                        </Button>
                    ) : null}
                    <CrudTableActions
                        row={row}
                        onEdit={() => startEdit(row.id, row)}
                        onDelete={() => void handleDelete(row)}
                        deleteLoading={deleteMutation.isPending && deleteMutation.variables === row.id}
                    />
                </div>
            )}
        />
    );
}