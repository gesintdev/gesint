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
import { TableActionButton } from "@/shared/components/crud/TableActionButton";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
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

    const flowLoading = (rowId: string, action: "submit" | "approve" | "conclude" | "cancel") =>
        flowMutation.isPending && flowMutation.variables?.id === rowId && flowMutation.variables?.action === action;

    return (
        <QueryTablePanel<DevelopmentPlan>
            queryKey={developmentPlanKeys.all}
            request={() => developmentPlanService.getAll()}
            columns={DEVELOPMENT_PLAN_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhum PDI cadastrado."
            onRowActivate={(row) => startEdit(row.id, row)}
            renderActions={(row) => (
                <>
                    {row.planStatus === "DRAFT" ? (
                        <TableActionButton
                            actionVariant="open"
                            aria-label="Enviar"
                            title="Enviar"
                            leftIcon={<Send className="size-3.5" />}
                            loading={flowLoading(row.id, "submit")}
                            onClick={(event) => {
                                event.stopPropagation();
                                void flow(row, "submit");
                            }}
                        />
                    ) : null}
                    {row.planStatus === "PENDING_APPROVAL" ? (
                        <TableActionButton
                            actionVariant="open"
                            aria-label="Aprovar"
                            title="Aprovar"
                            leftIcon={<Check className="size-3.5" />}
                            loading={flowLoading(row.id, "approve")}
                            onClick={(event) => {
                                event.stopPropagation();
                                void flow(row, "approve");
                            }}
                        />
                    ) : null}
                    {row.progress === 100 && row.planStatus !== "COMPLETED" ? (
                        <TableActionButton
                            actionVariant="edit"
                            aria-label="Concluir"
                            title="Concluir"
                            leftIcon={<Check className="size-3.5" />}
                            loading={flowLoading(row.id, "conclude")}
                            onClick={(event) => {
                                event.stopPropagation();
                                void flow(row, "conclude");
                            }}
                        />
                    ) : null}
                    {row.planStatus !== "COMPLETED" && row.planStatus !== "CANCELED" ? (
                        <TableActionButton
                            actionVariant="delete"
                            aria-label="Cancelar"
                            title="Cancelar"
                            leftIcon={<X className="size-3.5" />}
                            loading={flowLoading(row.id, "cancel")}
                            onClick={(event) => {
                                event.stopPropagation();
                                void flow(row, "cancel");
                            }}
                        />
                    ) : null}
                    <CrudTableActions
                        row={row}
                        onEdit={() => startEdit(row.id, row)}
                        onDelete={() => void handleDelete(row)}
                        deleteLoading={deleteMutation.isPending && deleteMutation.variables === row.id}
                    />
                </>
            )}
        />
    );
}
