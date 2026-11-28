"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { FileDown, Lock, LockOpen } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

import { useAccountPreferences } from "@/modules/cfg/account/hooks/useAccountPreferences";
import { AttendanceHistoryLinkButton } from "@/modules/gp/attendance/components/AttendanceHistoryLinkButton";
import {
    balanceColumn,
    dayStatusColumn,
    durationColumn,
} from "@/modules/gp/shared/config/time-table-columns";
import type { AttendanceDay, TimesheetDetail } from "@/modules/gp/shared/dto/time-management.dto";
import { invalidateTimeQueries } from "@/modules/gp/shared/lib/invalidate-time-queries";
import { ALERT_LABELS } from "@/modules/gp/shared/lib/time-labels";
import { timeManagementService, timesheetPdfFilename } from "@/modules/gp/shared/services/time-management.service";
import { timeManagementKeys } from "@/modules/gp/shared/time-management.query";
import { useHasPermission } from "@/shared/auth/permissions";
import { DashboardStats } from "@/shared/components/dashboard/DashboardStats";
import { Button } from "@/shared/components/ui/Button";
import { DataTable } from "@/shared/components/ui/DataTable";
import { InputString } from "@/shared/components/ui/input";
import { Modal } from "@/shared/components/ui/Modal";
import { ExceptionCapture } from "@/shared/exceptions";
import { useBranchScopedQueryKey } from "@/shared/hooks/useBranchScopedQueryKey";
import { closeReservedPdfWindow, deliverPdf, reservePdfWindow } from "@/shared/lib/pdf/pdf-delivery";
import { formatBalance, formatDuration } from "@/shared/lib/time/duration-format";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";

const dateFormatter = new Intl.DateTimeFormat("pt-BR");
const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" });
const weekdayFormatter = new Intl.DateTimeFormat("pt-BR", { weekday: "short" });

function todayIso(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function parseIsoDate(value: string): Date {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
}

type DayRow = AttendanceDay & {
    weekday: string;
    entry: string;
    interval: string;
    exit: string;
    balance: number;
    alertText: string;
};

function hm(value?: string | null): string {
    return value ? value.slice(0, 5) : "";
}

function toDayRow(day: AttendanceDay): DayRow {
    return {
        ...day,
        weekday: weekdayFormatter.format(parseIsoDate(day.date)).replace(".", ""),
        entry: hm(day.clockIn),
        interval: day.breakStart || day.breakEnd ? `${hm(day.breakStart) || "--:--"} – ${hm(day.breakEnd) || "--:--"}` : "",
        exit: hm(day.clockOut),
        balance: day.hourBankMinutes + day.overtimeMinutes - day.debitMinutes,
        alertText: day.alerts.map((alert) => ALERT_LABELS[alert]?.label ?? alert).join(" · "),
    };
}

const DAY_COLUMNS: TableColumnConfig[] = [
    { id: "date", columnName: "Dia", fieldValue: "date", dataType: TableDataType.DATE, notFilterable: true },
    { id: "weekday", columnName: "Sem.", fieldValue: "weekday", dataType: TableDataType.TEXT, notFilterable: true },
    { id: "entry", columnName: "Entrada", fieldValue: "entry", dataType: TableDataType.TEXT, notFilterable: true },
    { id: "interval", columnName: "Intervalo", fieldValue: "interval", dataType: TableDataType.TEXT, notFilterable: true },
    { id: "exit", columnName: "Saída", fieldValue: "exit", dataType: TableDataType.TEXT, notFilterable: true },
    durationColumn("expectedMinutes", "Previsto"),
    durationColumn("workedMinutes", "Trabalhado"),
    balanceColumn("balance", "Saldo"),
    dayStatusColumn(),
    { id: "alertText", columnName: "Alertas", fieldValue: "alertText", dataType: TableDataType.TEXT, notFilterable: true },
];

/** Espelho de um colaborador no período: dias apurados, totais, fechar/reabrir e PDF. */
export function TimesheetDetailModal({
    collaboratorId,
    from,
    to,
    onClose,
}: {
    collaboratorId: string | null;
    from: string;
    to: string;
    onClose: () => void;
}) {
    const queryClient = useQueryClient();
    const preferences = useAccountPreferences();
    const canWrite = useHasPermission("timesheet:write");
    const canExport = useHasPermission("timesheet:export");
    const [reopenOpen, setReopenOpen] = useState(false);
    const [reason, setReason] = useState("");
    const [reasonError, setReasonError] = useState<string | undefined>();
    const [generating, setGenerating] = useState(false);
    const queryKey = useBranchScopedQueryKey(timeManagementKeys.timesheet(collaboratorId ?? "", from, to));
    const query = useQuery({
        queryKey,
        queryFn: () => timeManagementService.timesheet(collaboratorId!, from, to),
        enabled: collaboratorId != null,
    });
    const detail = query.data;

    const refresh = async () => {
        await invalidateTimeQueries(queryClient);
    };

    const closeMutation = useMutation({
        mutationFn: () => timeManagementService.closeTimesheets(from, to, collaboratorId ? [collaboratorId] : []),
        onSuccess: async () => {
            await refresh();
            toast.success("Espelho fechado. As marcações do período ficaram travadas.");
        },
        onError: (error: unknown) => ExceptionCapture.handle(error, { fallbackMessage: "Não foi possível fechar o espelho." }),
    });

    const reopenMutation = useMutation({
        mutationFn: () => timeManagementService.reopenTimesheet(collaboratorId!, from, to, reason.trim()),
        onSuccess: async () => {
            await refresh();
            setReopenOpen(false);
            setReason("");
            toast.success("Espelho reaberto para ajustes");
        },
        onError: (error: unknown) => ExceptionCapture.handle(error, { fallbackMessage: "Não foi possível reabrir o espelho." }),
    });

    const generatePdf = async () => {
        if (!collaboratorId) return;
        const mode = preferences.data?.reportPdfDeliveryMode ?? "DOWNLOAD";
        let popup: Window | null = null;
        try {
            popup = reservePdfWindow(mode);
            setGenerating(true);
            const blob = await timeManagementService.timesheetPdf(collaboratorId, from, to);
            deliverPdf(blob, mode, timesheetPdfFilename(from, to), popup);
        } catch (error) {
            closeReservedPdfWindow(popup);
            toast.error(
                error instanceof Error && error.message === "POPUP_BLOCKED"
                    ? "O navegador bloqueou a nova aba. Libere pop-ups para o Gesint."
                    : "Não foi possível gerar o espelho em PDF",
            );
        } finally {
            setGenerating(false);
        }
    };

    const closed = detail?.closingStatus === "CLOSED";
    const periodEnded = to < todayIso();

    return (
        <>
            <Modal
                open={collaboratorId != null}
                onClose={onClose}
                size="full"
                title={detail ? `Espelho de ponto · ${detail.collaboratorName}` : "Espelho de ponto"}
                subtitle={
                    detail
                        ? [
                              `${dateFormatter.format(parseIsoDate(detail.periodStart))} a ${dateFormatter.format(parseIsoDate(detail.periodEnd))}`,
                              detail.jobTitle,
                              detail.workScheduleName,
                          ]
                              .filter(Boolean)
                              .join(" · ")
                        : undefined
                }
                headerActions={
                    detail ? (
                        <span className={`gesint-badge ${closed ? "gesint-badge--success" : "gesint-badge--warning"}`}>
                            {closed
                                ? `Fechado${detail.closedAt ? ` em ${dateTimeFormatter.format(new Date(detail.closedAt))}` : ""}`
                                : "Aberto"}
                        </span>
                    ) : null
                }
                footer={
                    detail ? (
                        <div className="flex w-full flex-wrap items-center justify-between gap-2">
                            <p className="text-[12px] text-base-content/55">
                                {closed
                                    ? "Fechado: as marcações do período não podem ser alteradas até reabrir."
                                    : !periodEnded
                                      ? "O período ainda está em andamento. O espelho pode ser fechado depois do último dia."
                                      : detail.pendingCount > 0
                                      ? `Resolva ${detail.pendingCount} ${detail.pendingCount === 1 ? "pendência" : "pendências"} antes de fechar.`
                                      : "Sem pendências: o espelho pode ser fechado."}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {canExport ? (
                                    <Button
                                        variant="outline"
                                        leftIcon={<FileDown className="size-4" />}
                                        loading={generating}
                                        onClick={() => void generatePdf()}
                                    >
                                        Gerar PDF
                                    </Button>
                                ) : null}
                                {canWrite && closed ? (
                                    <Button variant="outline" leftIcon={<LockOpen className="size-4" />} onClick={() => setReopenOpen(true)}>
                                        Reabrir
                                    </Button>
                                ) : null}
                                {canWrite && !closed ? (
                                    <Button
                                        variant="primary"
                                        leftIcon={<Lock className="size-4" />}
                                        disabled={detail.pendingCount > 0 || !periodEnded}
                                        loading={closeMutation.isPending}
                                        onClick={() => closeMutation.mutate()}
                                    >
                                        Fechar espelho
                                    </Button>
                                ) : null}
                            </div>
                        </div>
                    ) : undefined
                }
            >
                {query.isLoading || !detail ? (
                    <div className="skeleton-stack">
                        <div className="skeleton-shimmer h-16 w-full" />
                        <div className="skeleton-shimmer h-72 w-full" />
                    </div>
                ) : (
                    <TimesheetDetailBody detail={detail} from={from} to={to} onOpenHistory={onClose} />
                )}
            </Modal>
            <Modal
                open={reopenOpen}
                onClose={() => setReopenOpen(false)}
                size="md"
                title="Reabrir espelho de ponto"
                subtitle="O motivo fica registrado na trilha de auditoria."
                actions={[
                    { title: "Cancelar", variant: "ghost", onClick: () => setReopenOpen(false) },
                    {
                        title: "Reabrir",
                        variant: "primary",
                        loading: reopenMutation.isPending,
                        onClick: () => {
                            if (!reason.trim()) {
                                setReasonError("Informe o motivo para reabrir.");
                                return;
                            }
                            setReasonError(undefined);
                            reopenMutation.mutate();
                        },
                    },
                ]}
            >
                <InputString
                    label="Motivo"
                    value={reason}
                    onValueChange={setReason}
                    error={reasonError}
                    maxLength={300}
                    placeholder="Ex.: correção de marcação solicitada pelo colaborador"
                />
            </Modal>
        </>
    );
}

function TimesheetDetailBody({
    detail,
    from,
    to,
    onOpenHistory,
}: {
    detail: TimesheetDetail;
    from: string;
    to: string;
    onOpenHistory: () => void;
}) {
    const canEditAttendance = useHasPermission("attendance:write");
    const rows = detail.days.filter((day) => day.status !== "NOT_EMPLOYED").map(toDayRow);
    const stats = [
        { label: "Jornada prevista", value: detail.expectedMinutes, format: formatDuration },
        { label: "Horas trabalhadas", value: detail.workedMinutes, format: formatDuration },
        ...(detail.overtimeEnabled ? [{ label: "Horas extras", value: detail.overtimeMinutes, format: formatDuration }] : []),
        ...(detail.hourBankEnabled
            ? [
                  { label: "Banco no período", value: detail.hourBankMinutes, format: formatBalance },
                  { label: "Saldo do banco", value: detail.totalBalanceMinutes, format: formatBalance },
              ]
            : []),
        { label: "Pendências", value: detail.pendingCount },
    ];
    return (
        <div className="flex flex-col gap-3">
            <div className="gesint-time-stats-wrap">
                <DashboardStats stats={stats} />
            </div>
            {detail.reopenReason && detail.closingStatus === "OPEN" ? (
                <p className="text-[12px] text-base-content/55">Reaberto: {detail.reopenReason}</p>
            ) : null}
            <div className="min-h-0 overflow-auto rounded-xl border border-(--gesint-border-subtle)">
                <DataTable
                    data={rows}
                    columns={DAY_COLUMNS}
                    rowKey="date"
                    getRowClassName={(row) =>
                        ["DAY_OFF", "HOLIDAY", "VACATION", "LEAVE"].includes(row.status) ? "gesint-time-row--rest" : undefined
                    }
                    renderActions={canEditAttendance ? () => (
                        <AttendanceHistoryLinkButton
                            collaboratorId={detail.collaboratorId}
                            collaboratorName={detail.collaboratorName}
                            from={from}
                            to={to}
                            onOpened={onOpenHistory}
                        />
                    ) : undefined}
                />
            </div>
        </div>
    );
}
