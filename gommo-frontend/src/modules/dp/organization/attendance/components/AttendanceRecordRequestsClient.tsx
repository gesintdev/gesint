"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

import { notificationKeys } from "@/modules/cfg/settings/notification/notification.query";
import { attendancerecordKeys } from "@/modules/dp/organization/attendance/attendance.query";
import type {
    AttendanceRecord,
    AttendanceReviewAction,
} from "@/modules/dp/organization/attendance/dto/attendance-record.dto";
import { attendancerecordService } from "@/modules/dp/organization/attendance/services/attendance-record.service";
import { QueryPanel } from "@/shared/components/data/DataPanel";
import { Button } from "@/shared/components/ui/Button";
import { DataTable } from "@/shared/components/ui/DataTable";
import { ExceptionCapture } from "@/shared/exceptions";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";

const REQUEST_COLUMNS: TableColumnConfig[] = [
    { id: "code", columnName: "Código", fieldValue: "code", dataType: TableDataType.TEXT },
    { id: "workDate", columnName: "Data", fieldValue: "workDate", dataType: TableDataType.DATE },
    { id: "requestKindLabel", columnName: "Solicitação", fieldValue: "requestKindLabel", dataType: TableDataType.TEXT },
    { id: "requestTypeLabel", columnName: "Tipo", fieldValue: "requestTypeLabel", dataType: TableDataType.TEXT },
    { id: "summary", columnName: "Horários", fieldValue: "summary", dataType: TableDataType.TEXT },
    { id: "notes", columnName: "Justificativa", fieldValue: "notes", dataType: TableDataType.TEXT },
];

const requestTypeLabel: Record<string, string> = {
    TIME_ADJUSTMENT: "Ajuste de ponto",
    DAY_ABSENCE_EXCUSE: "Abono de dia",
    MEDICAL_CERTIFICATE: "Atestado médico",
    LEAVE_ABSENCE: "Afastamento",
    HOUR_BANK: "Banco de horas",
    OTHER: "Outro",
};

function formatTime(value?: string) {
    return value ? value.slice(0, 5) : "-";
}

function requestKindLabel(row: AttendanceRecord) {
    if (row.requestType !== "TIME_ADJUSTMENT") {
        return "Solicitação geral";
    }

    return row.referenceId ? "Alteração de batida" : "Novo ponto manual";
}

function requestSummary(row: AttendanceRecord) {
    const entries = [
        ["Entrada", row.clockIn],
        ["Saída almoço", row.breakStart],
        ["Retorno almoço", row.breakEnd],
        ["Fim expediente", row.clockOut],
    ].filter(([, value]) => Boolean(value));

    if (!entries.length) return "Sem horários informados";

    return entries.map(([label, value]) => `${label}: ${formatTime(value)}`).join(" | ");
}

type RequestRow = AttendanceRecord & {
    requestKindLabel: string;
    requestTypeLabel: string;
    summary: string;
};

type ReviewDialog = { row: AttendanceRecord; action: AttendanceReviewAction } | null;

export function AttendanceRecordRequestsClient() {
    const queryClient = useQueryClient();
    const [dialog, setDialog] = useState<ReviewDialog>(null);
    const [reason, setReason] = useState("");

    const reviewMutation = useMutation({
        mutationFn: (payload: { id: string; action: AttendanceReviewAction; reason?: string }) =>
            attendancerecordService.review(payload.id, payload.action, payload.reason),
        onSuccess: async (_data, variables) => {
            await queryClient.invalidateQueries({ queryKey: attendancerecordKeys.all });
            await queryClient.invalidateQueries({ queryKey: [...attendancerecordKeys.all, "pending-requests"] });
            await queryClient.invalidateQueries({ queryKey: notificationKeys.summary });
            toast.success(variables.action === "APPROVE" ? "Solicitação aprovada" : "Solicitação reprovada");
            setDialog(null);
            setReason("");
        },
        onError: (err: unknown) => {
            ExceptionCapture.handle(err, { fallbackMessage: "Não foi possível revisar a solicitação." });
        },
    });

    return (
        <>
            <QueryPanel<AttendanceRecord>
                queryKey={[...attendancerecordKeys.all, "pending-requests"]}
                request={() => attendancerecordService.pendingRequests()}
            >
                {({ data }) => {
                    const rows: RequestRow[] = data.map((row) => ({
                        ...row,
                        requestKindLabel: requestKindLabel(row),
                        requestTypeLabel: requestTypeLabel[row.requestType ?? ""] ?? row.requestType ?? "-",
                        summary: requestSummary(row),
                    }));

                    return (
                        <DataTable<RequestRow>
                            columns={REQUEST_COLUMNS}
                            data={rows}
                            emptyMessage="Nenhuma solicitação de ajuste pendente."
                            rowKey="id"
                            renderActions={(row) => (
                                <div className="flex flex-wrap justify-end gap-1.5">
                                    <Button
                                        size="sm"
                                        variant="success"
                                        loading={reviewMutation.isPending}
                                        onClick={() => reviewMutation.mutate({ id: row.id, action: "APPROVE" })}
                                    >
                                        Aprovar
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="danger"
                                        onClick={() => setDialog({ row, action: "REJECT" })}
                                    >
                                        Reprovar
                                    </Button>
                                </div>
                            )}
                        />
                    );
                }}
            </QueryPanel>

            {dialog ? (
                <dialog className="modal modal-open">
                    <div className="modal-box rounded-2xl border border-base-300 bg-base-100 shadow-sm">
                        <h3 className="text-sm font-semibold text-base-content">Reprovar solicitação</h3>
                        <p className="mt-2 text-sm text-base-content/65">
                            Informe o motivo para manter histórico de auditoria.
                        </p>
                        <textarea
                            className="textarea textarea-bordered mt-4 min-h-28 w-full rounded-lg"
                            value={reason}
                            onChange={(event) => setReason(event.target.value)}
                            placeholder="Motivo da reprovação"
                        />
                        <div className="modal-action">
                            <Button type="button" variant="ghost" onClick={() => setDialog(null)}>
                                Cancelar
                            </Button>
                            <Button
                                type="button"
                                variant="danger"
                                loading={reviewMutation.isPending}
                                onClick={() => reviewMutation.mutate({ id: dialog.row.id, action: "REJECT", reason })}
                            >
                                Reprovar
                            </Button>
                        </div>
                    </div>
                </dialog>
            ) : null}
        </>
    );
}
