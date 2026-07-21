"use client";

import {useMutation, useQueryClient} from "@tanstack/react-query";
import {Check, Eye, X} from "lucide-react";
import {useState} from "react";
import {toast} from "sonner";

import {notificationKeys} from "@/modules/cfg/settings/notification/notification.query";
import {attendancerecordKeys} from "@/modules/dp/attendance/attendance.query";
import {AttendanceRequestDetailModal} from "@/modules/dp/attendance/components/AttendanceRequestDetailModal";
import {AttendanceRequestRejectDialog} from "@/modules/dp/attendance/components/AttendanceRequestRejectDialog";
import type {
    AttendanceRequest,
    AttendanceReviewAction,
} from "@/modules/dp/attendance/dto/attendance-record.dto";
import {attendancerecordService} from "@/modules/dp/attendance/services/attendance-record.service";
import {TableActionButton} from "@/shared/components/crud/TableActionButton";
import {QueryTablePanel} from "@/shared/components/data/DataPanel";
import {ExceptionCapture} from "@/shared/exceptions";
import {type TableColumnConfig, TableDataType} from "@/shared/types/table.types";

const REQUEST_COLUMNS: TableColumnConfig[] = [
    {id: "code", columnName: "Código", fieldValue: "code", dataType: TableDataType.TEXT},
    {id: "collaboratorName", columnName: "Colaborador", fieldValue: "collaboratorName", dataType: TableDataType.TEXT},
    {id: "workDate", columnName: "Data", fieldValue: "workDate", dataType: TableDataType.DATE},
    {id: "requestTypeLabel", columnName: "Tipo", fieldValue: "requestTypeLabel", dataType: TableDataType.TEXT},
    {id: "requestStatusLabel", columnName: "Status", fieldValue: "requestStatusLabel", dataType: TableDataType.TEXT},
    {id: "clockInCompare", columnName: "Entrada", fieldValue: "clockInCompare", dataType: TableDataType.TEXT},
    {
        id: "breakStartCompare",
        columnName: "Saída almoço",
        fieldValue: "breakStartCompare",
        dataType: TableDataType.TEXT
    },
    {id: "breakEndCompare", columnName: "Retorno almoço", fieldValue: "breakEndCompare", dataType: TableDataType.TEXT},
    {id: "clockOutCompare", columnName: "Saída", fieldValue: "clockOutCompare", dataType: TableDataType.TEXT},
    {id: "notes", columnName: "Justificativa", fieldValue: "notes", dataType: TableDataType.TEXT},
];

const requestTypeLabel: Record<string, string> = {
    TIME_ADJUSTMENT: "Ajuste de ponto",
    DAY_ABSENCE_EXCUSE: "Abono de dia",
    MEDICAL_CERTIFICATE: "Atestado médico",
    LEAVE_ABSENCE: "Afastamento",
    HOUR_BANK: "Banco de horas",
    OTHER: "Outro",
};

const requestStatusLabel: Record<string, string> = {
    PENDING: "Pendente",
    APPROVED: "Aprovada",
    REJECTED: "Reprovada",
};

function formatTime(value?: string) {
    return value ? value.slice(0, 5) : "—";
}

function compareTime(original?: string, requested?: string) {
    const from = formatTime(original);
    const to = formatTime(requested);
    if (from === to) return from;
    if (!requested) return from;
    if (!original) return to;
    return `${from} → ${to}`;
}

type RequestRow = AttendanceRequest & {
    requestTypeLabel: string;
    requestStatusLabel: string;
    clockInCompare: string;
    breakStartCompare: string;
    breakEndCompare: string;
    clockOutCompare: string;
};

function toRow(row: AttendanceRequest): RequestRow {
    return {
        ...row,
        requestTypeLabel: requestTypeLabel[row.requestType] ?? row.requestType,
        requestStatusLabel: requestStatusLabel[row.requestStatus] ?? row.requestStatus,
        clockInCompare: compareTime(row.originalClockIn, row.clockIn),
        breakStartCompare: compareTime(row.originalBreakStart, row.breakStart),
        breakEndCompare: compareTime(row.originalBreakEnd, row.breakEnd),
        clockOutCompare: compareTime(row.originalClockOut, row.clockOut),
    };
}

export function AttendanceRecordRequestsClient() {
    const queryClient = useQueryClient();
    const [selected, setSelected] = useState<AttendanceRequest | null>(null);
    const [rejectTarget, setRejectTarget] = useState<AttendanceRequest | null>(null);

    const reviewMutation = useMutation({
        mutationFn: (payload: { id: string; action: AttendanceReviewAction; reason?: string }) =>
            attendancerecordService.review(payload.id, payload.action, payload.reason),
        onSuccess: async (_data, variables) => {
            await queryClient.invalidateQueries({queryKey: attendancerecordKeys.all});
            await queryClient.invalidateQueries({queryKey: [...attendancerecordKeys.all, "requests"]});
            await queryClient.invalidateQueries({queryKey: [...attendancerecordKeys.all, "pending-requests"]});
            await queryClient.invalidateQueries({queryKey: notificationKeys.summary});
            toast.success(variables.action === "APPROVE" ? "Solicitação aprovada" : "Solicitação reprovada");
            setSelected(null);
            setRejectTarget(null);
        },
        onError: (err: unknown) => {
            ExceptionCapture.handle(err, {fallbackMessage: "Não foi possível revisar a solicitação."});
        },
    });

    return (
        <>
            <QueryTablePanel<RequestRow>
                queryKey={[...attendancerecordKeys.all, "requests"]}
                request={async () => {
                    const rows = await attendancerecordService.listRequests();
                    return rows.map(toRow);
                }}
                columns={REQUEST_COLUMNS}
                rowKey="id"
                emptyMessage="Nenhuma solicitação de ponto encontrada."
                rowActivateOn="doubleclick"
                onRowActivate={(row) => setSelected(row)}
                renderActions={(row) => (
                    <>
                        {row.requestStatus === "PENDING" ? (
                            <>
                                <TableActionButton
                                    actionVariant="open"
                                    aria-label="Aprovar"
                                    title="Aprovar"
                                    leftIcon={<Check className="size-3.5"/>}
                                    loading={
                                        reviewMutation.isPending &&
                                        reviewMutation.variables?.id === row.id &&
                                        reviewMutation.variables?.action === "APPROVE"
                                    }
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        reviewMutation.mutate({id: row.id, action: "APPROVE"});
                                    }}
                                />
                                <TableActionButton
                                    actionVariant="delete"
                                    aria-label="Recusar"
                                    title="Recusar"
                                    leftIcon={<X className="size-3.5"/>}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        setRejectTarget(row);
                                    }}
                                />
                            </>
                        ) : null}
                        <TableActionButton
                            actionVariant="edit"
                            aria-label="Detalhar"
                            title="Detalhar"
                            leftIcon={<Eye className="size-3.5"/>}
                            onClick={(event) => {
                                event.stopPropagation();
                                setSelected(row);
                            }}
                        />
                    </>
                )}
            />

            <AttendanceRequestDetailModal
                request={selected}
                open={Boolean(selected)}
                reviewing={reviewMutation.isPending}
                onClose={() => setSelected(null)}
                onApprove={() => {
                    if (!selected) return;
                    reviewMutation.mutate({id: selected.id, action: "APPROVE"});
                }}
                onReject={(reason) => {
                    if (!selected) return;
                    reviewMutation.mutate({id: selected.id, action: "REJECT", reason});
                }}
            />

            <AttendanceRequestRejectDialog
                open={Boolean(rejectTarget)}
                loading={reviewMutation.isPending}
                onClose={() => setRejectTarget(null)}
                onConfirm={(reason) => {
                    if (!rejectTarget) return;
                    reviewMutation.mutate({id: rejectTarget.id, action: "REJECT", reason});
                }}
            />
        </>
    );
}
