"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Download, Printer } from "lucide-react";
import { toast } from "sonner";

import { PAYSLIP_TABLE_COLUMNS } from "@/modules/ctb/payroll/payslip/config/payslip.table-columns";
import type { Payslip } from "@/modules/ctb/payroll/payslip/dto/payslip.dto";
import { PAYSLIP_CLIENT_MESSAGES } from "@/modules/ctb/payroll/payslip/exceptions/payslip.messages";
import { payslipKeys } from "@/modules/ctb/payroll/payslip/payslip.query";
import {
    openPayslipPdf,
    payslipPdfFilename,
    payslipService,
} from "@/modules/ctb/payroll/payslip/services/payslip.service";
import { hasPermission, useSessionPermissions } from "@/shared/auth/permissions";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { TableActionButton } from "@/shared/components/crud/TableActionButton";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

export function PayslipListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();
    const permissions = useSessionPermissions();
    const canReadPdf = hasPermission(permissions, "payslip:read");

    const deleteMutation = useMutation({
        mutationFn: (id: string) => payslipService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: payslipKeys.all });
            toast.success("Holerite excluído(a)");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: PAYSLIP_CLIENT_MESSAGES.PAYSLIP_LOAD_FAILED }),
    });

    const pdfMutation = useMutation({
        mutationFn: async ({ row, mode }: { row: Payslip; mode: "download" | "print" }) => {
            const blob = await payslipService.downloadPdf(row.id);
            await openPayslipPdf(blob, mode, payslipPdfFilename(row));
        },
        onSuccess: (_data, variables) => {
            toast.success(
                variables.mode === "download" ? "PDF do holerite baixado" : "PDF do holerite aberto para impressão",
            );
        },
        onError: (err: unknown) => {
            if (err instanceof Error && err.message === "POPUP_BLOCKED") {
                toast.error(PAYSLIP_CLIENT_MESSAGES.PAYSLIP_PDF_POPUP_BLOCKED);
                return;
            }
            ExceptionCapture.handle(err, { fallbackMessage: PAYSLIP_CLIENT_MESSAGES.PAYSLIP_PDF_FAILED });
        },
    });

    const handleDelete = async (row: Payslip) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <QueryTablePanel<Payslip>
            queryKey={payslipKeys.all}
            request={() => payslipService.getAll()}
            columns={PAYSLIP_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhum(a) holerite cadastrado(a)."
            onRowActivate={(row) => startEdit(row.id, row)}
            renderActions={(row) => (
                <>
                    {canReadPdf ? (
                        <>
                            <TableActionButton
                                actionVariant="download"
                                aria-label="Baixar PDF"
                                title="Baixar PDF"
                                leftIcon={<Download className="size-3.5" />}
                                loading={
                                    pdfMutation.isPending &&
                                    pdfMutation.variables?.row.id === row.id &&
                                    pdfMutation.variables.mode === "download"
                                }
                                onClick={(e) => {
                                    e.stopPropagation();
                                    pdfMutation.mutate({ row, mode: "download" });
                                }}
                            />
                            <TableActionButton
                                actionVariant="open"
                                aria-label="Imprimir PDF"
                                title="Imprimir PDF"
                                leftIcon={<Printer className="size-3.5" />}
                                loading={
                                    pdfMutation.isPending &&
                                    pdfMutation.variables?.row.id === row.id &&
                                    pdfMutation.variables.mode === "print"
                                }
                                onClick={(e) => {
                                    e.stopPropagation();
                                    pdfMutation.mutate({ row, mode: "print" });
                                }}
                            />
                        </>
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
