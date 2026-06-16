"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Lock, LockOpen, Play } from "lucide-react";
import { toast } from "sonner";
import { PAYROLL_CLIENT_MESSAGES } from "@/modules/payroll/exceptions/payroll-run.messages";
import { PAYROLL_TABLE_COLUMNS } from "@/modules/payroll/config/payroll-run.table-columns";
import type { PayrollRun } from "@/modules/payroll/dto/payroll-run.dto";
import { formatPayrollReference } from "@/modules/payroll/lib/payroll-run.mapper";
import {
    canClosePayrollRun,
    canDeletePayrollRun,
    canProcessPayrollRun,
    canReopenPayrollRun,
    canReviewPayrollRun,
} from "@/modules/payroll/lib/payroll-run-lifecycle";
import { payrollrunKeys } from "@/modules/payroll/payroll.query";
import { payrollrunService } from "@/modules/payroll/services/payroll-run.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { TableActionButton } from "@/shared/components/crud/TableActionButton";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";
import {
    deriveWritePermission,
    useSessionPermissions,
} from "@/shared/auth/permissions";
import { canWriteRoute } from "@/shared/auth/route-access";
import { useWorkspaceTabOptional } from "@/shared/workspace/WorkspaceTabContext";
import { findRouteById } from "@/shared/workspace/workspace-routes";

type PayrollRunListRow = PayrollRun & {
    referencePeriod: string;
};

type LifecycleAction = "review" | "close" | "reopen";

async function loadPayrollRunRows(): Promise<PayrollRunListRow[]> {
    const runs = await payrollrunService.getAll();

    return runs.map((run) => ({
        ...run,
        referencePeriod: formatPayrollReference(run.referenceDate),
    }));
}

export function PayrollRunListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();
    const permissions = useSessionPermissions();
    const wsTab = useWorkspaceTabOptional();
    const route = wsTab ? findRouteById(wsTab.tab.routeId) : undefined;
    const canWrite = canWriteRoute(route, permissions, deriveWritePermission(route?.permission));

    const invalidate = async () => {
        await queryClient.invalidateQueries({ queryKey: payrollrunKeys.all });
    };

    const deleteMutation = useMutation({
        mutationFn: (id: string) => payrollrunService.remove(id),
        onSuccess: async () => {
            await invalidate();
            toast.success("Competência excluída");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: PAYROLL_CLIENT_MESSAGES.PAYROLL_LOAD_FAILED }),
    });

    const processMutation = useMutation({
        mutationFn: (id: string) => payrollrunService.process(id),
        onSuccess: async (result) => {
            await invalidate();
            toast.success(
                `Competência processada (${result.payslipsProcessed} holerite${result.payslipsProcessed === 1 ? "" : "s"})`,
            );
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: PAYROLL_CLIENT_MESSAGES.PAYROLL_PROCESS_FAILED }),
    });

    const lifecycleMutation = useMutation({
        mutationFn: ({ id, action }: { id: string; action: LifecycleAction }) => {
            if (action === "review") return payrollrunService.review(id);
            if (action === "close") return payrollrunService.close(id);
            return payrollrunService.reopen(id);
        },
        onSuccess: async (_data, variables) => {
            await invalidate();
            const message =
                variables.action === "review"
                    ? "Competência revisada"
                    : variables.action === "close"
                      ? "Competência fechada"
                      : "Competência reaberta";
            toast.success(message);
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: PAYROLL_CLIENT_MESSAGES.PAYROLL_LIFECYCLE_FAILED }),
    });

    const handleDelete = async (row: PayrollRun) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    const handleProcess = async (row: PayrollRun) => {
        if (
            !(await SystemAlert.confirm({
                title: "Processar competência",
                message: `Calcular holerites da competência ${formatPayrollReference(row.referenceDate)}?`,
                confirmLabel: "Processar",
            }))
        ) {
            return;
        }
        processMutation.mutate(row.id);
    };

    const handleLifecycle = async (row: PayrollRun, action: LifecycleAction) => {
        const reference = formatPayrollReference(row.referenceDate);
        const config =
            action === "review"
                ? {
                      title: "Revisar competência",
                      message: `Marcar a competência ${reference} como revisada antes do fechamento?`,
                      confirmLabel: "Revisar",
                  }
                : action === "close"
                  ? {
                        title: "Fechar competência",
                        message: `Fechar a competência ${reference}? Nenhuma alteração será permitida até reabrir.`,
                        confirmLabel: "Fechar",
                    }
                  : {
                        title: "Reabrir competência",
                        message: `Reabrir a competência ${reference} para novos ajustes?`,
                        confirmLabel: "Reabrir",
                    };

        if (!(await SystemAlert.confirm(config))) return;
        lifecycleMutation.mutate({ id: row.id, action });
    };

    const lifecycleLoading = (row: PayrollRun, action: LifecycleAction) =>
        lifecycleMutation.isPending
        && lifecycleMutation.variables?.id === row.id
        && lifecycleMutation.variables.action === action;

    return (
        <QueryTablePanel<PayrollRunListRow>
            queryKey={payrollrunKeys.all}
            request={loadPayrollRunRows}
            columns={PAYROLL_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhuma competência cadastrada."
            onRowActivate={(row) => startEdit(row.id, row)}
            renderActions={(row) => (
                <>
                    {canWrite && canProcessPayrollRun(row.payrollStatus) ? (
                        <TableActionButton
                            actionVariant="open"
                            aria-label="Processar competência"
                            title="Processar competência"
                            leftIcon={<Play className="size-3.5" />}
                            loading={processMutation.isPending && processMutation.variables === row.id}
                            onClick={(e) => {
                                e.stopPropagation();
                                void handleProcess(row);
                            }}
                        />
                    ) : null}
                    {canWrite && canReviewPayrollRun(row.payrollStatus) ? (
                        <TableActionButton
                            actionVariant="edit"
                            aria-label="Revisar competência"
                            title="Revisar competência"
                            leftIcon={<CheckCircle2 className="size-3.5" />}
                            loading={lifecycleLoading(row, "review")}
                            onClick={(e) => {
                                e.stopPropagation();
                                void handleLifecycle(row, "review");
                            }}
                        />
                    ) : null}
                    {canWrite && canClosePayrollRun(row.payrollStatus) ? (
                        <TableActionButton
                            actionVariant="edit"
                            aria-label="Fechar competência"
                            title="Fechar competência"
                            leftIcon={<Lock className="size-3.5" />}
                            loading={lifecycleLoading(row, "close")}
                            onClick={(e) => {
                                e.stopPropagation();
                                void handleLifecycle(row, "close");
                            }}
                        />
                    ) : null}
                    {canWrite && canReopenPayrollRun(row.payrollStatus) ? (
                        <TableActionButton
                            actionVariant="open"
                            aria-label="Reabrir competência"
                            title="Reabrir competência"
                            leftIcon={<LockOpen className="size-3.5" />}
                            loading={lifecycleLoading(row, "reopen")}
                            onClick={(e) => {
                                e.stopPropagation();
                                void handleLifecycle(row, "reopen");
                            }}
                        />
                    ) : null}
                    <CrudTableActions
                        row={row}
                        onEdit={() => startEdit(row.id, row)}
                        onDelete={canDeletePayrollRun(row.payrollStatus) ? () => void handleDelete(row) : undefined}
                        deleteLoading={deleteMutation.isPending && deleteMutation.variables === row.id}
                    />
                </>
            )}
        />
    );
}
