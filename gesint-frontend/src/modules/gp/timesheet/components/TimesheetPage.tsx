"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Eye, Lock } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";

import { attendanceSettingsKeys } from "@/modules/gp/attendance/attendance.query";
import { AttendancePeriodDateFilters } from "@/modules/gp/attendance/components/AttendancePeriodDateFilters";
import { PENDING_BADGE_CLASS_NAMES } from "@/modules/gp/attendance/config/attendance-record.table-columns";
import { currentMonthBounds, normalizePeriod } from "@/modules/gp/attendance/lib/attendance-period.util";
import { attendancerecordService } from "@/modules/gp/attendance/services/attendance-record.service";
import {
    balanceColumn,
    durationColumn,
    GP_COLLABORATOR_COLUMN,
} from "@/modules/gp/shared/config/time-table-columns";
import type { TimesheetRow } from "@/modules/gp/shared/dto/time-management.dto";
import { timeManagementService } from "@/modules/gp/shared/services/time-management.service";
import { timeManagementKeys } from "@/modules/gp/shared/time-management.query";
import { TimesheetDetailModal } from "@/modules/gp/timesheet/components/TimesheetDetailModal";
import { useHasPermission } from "@/shared/auth/permissions";
import { TableActionButton } from "@/shared/components/crud/TableActionButton";
import { QueryPagedTablePanel } from "@/shared/components/data/DataPanel";
import { WorkspacePage } from "@/shared/components/layout/WorkspacePage";
import { Button } from "@/shared/components/ui/Button";
import { CrudTabList } from "@/shared/components/ui/CrudTabList";
import { ExceptionCapture } from "@/shared/exceptions";
import { paginateCatalogRows } from "@/shared/lib/table/paginate-catalog-rows";
import { SystemAlert } from "@/shared/system-alert";
import { type TableColumnConfig, TableDataType } from "@/shared/types/table.types";

type Bucket = "ALL" | "PENDING" | "CLOSED";

type Row = TimesheetRow & { pendingLabel: string };

const CLOSING_BADGES = { OPEN: "Aberto", CLOSED: "Fechado" };
const CLOSING_CLASSES = { OPEN: "gesint-badge--warning", CLOSED: "gesint-badge--success" };

function columns(overtime: boolean, bank: boolean): TableColumnConfig[] {
    return [
        GP_COLLABORATOR_COLUMN,
        { id: "workScheduleName", columnName: "Escala", fieldValue: "workScheduleName", dataType: TableDataType.TEXT },
        durationColumn("workedMinutes", "Trabalhado"),
        ...(overtime ? [durationColumn("overtimeMinutes", "Horas extras")] : []),
        ...(bank ? [balanceColumn("hourBankMinutes", "Banco no período")] : []),
        {
            id: "pendingLabel",
            columnName: "Pendências",
            fieldValue: "pendingLabel",
            dataType: TableDataType.BADGE,
            badgeClassNames: PENDING_BADGE_CLASS_NAMES,
            notFilterable: true,
        },
        {
            id: "closingStatus",
            columnName: "Situação",
            fieldValue: "closingStatus",
            dataType: TableDataType.BADGE,
            badgeLabels: CLOSING_BADGES,
            badgeClassNames: CLOSING_CLASSES,
        },
    ];
}

/** Espelho de ponto por colaborador: aberto para ajustes ou fechado (marcações travadas). */
export function TimesheetPage() {
    const queryClient = useQueryClient();
    const canWrite = useHasPermission("timesheet:write");
    const [dateFrom, setDateFrom] = useState(() => currentMonthBounds().from);
    const [dateTo, setDateTo] = useState(() => currentMonthBounds().to);
    const period = useMemo(() => normalizePeriod(dateFrom, dateTo), [dateFrom, dateTo]);
    const [bucket, setBucket] = useState<Bucket>("ALL");
    const settingsQuery = useQuery({
        queryKey: attendanceSettingsKeys.all,
        queryFn: () => attendancerecordService.getSettings(),
        staleTime: 60_000,
    });
    const regime = {
        overtime: settingsQuery.data?.overtimeEnabled ?? false,
        bank: settingsQuery.data?.hourBankEnabled ?? true,
    };
    const [selected, setSelected] = useState<string | null>(null);

    const closeAll = useMutation({
        mutationFn: () => timeManagementService.closeTimesheets(period.from, period.to),
        onSuccess: async (result) => {
            await queryClient.invalidateQueries({ queryKey: timeManagementKeys.all });
            if (result.skippedWithPending.length > 0) {
                toast.warning(
                    `${result.closed} ${result.closed === 1 ? "espelho fechado" : "espelhos fechados"}. ` +
                        `${result.skippedWithPending.length} ficaram abertos por terem pendências.`,
                );
            } else {
                toast.success(`${result.closed} ${result.closed === 1 ? "espelho fechado" : "espelhos fechados"}`);
            }
        },
        onError: (error: unknown) => ExceptionCapture.handle(error, { fallbackMessage: "Não foi possível fechar os espelhos." }),
    });

    const now = new Date();
    const todayIso = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    const periodEnded = period.to < todayIso;

    const confirmCloseAll = async () => {
        const ok = await SystemAlert.confirm({
            variant: "warning",
            title: "Fechar espelhos do período",
            message:
                "Os espelhos sem pendências serão fechados e as marcações do período ficarão travadas. " +
                "Quem tiver pendência continua aberto. Para alterar depois, é preciso reabrir com motivo.",
            confirmLabel: "Fechar espelhos",
        });
        if (ok) closeAll.mutate();
    };

    return (
        <WorkspacePage>
            <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <div className="crud-list-toolbar flex flex-wrap items-center justify-between gap-3 px-4 py-2">
                    <AttendancePeriodDateFilters
                        dateFrom={dateFrom}
                        dateTo={dateTo}
                        onDateFromChange={setDateFrom}
                        onDateToChange={setDateTo}
                    />
                    {canWrite ? (
                        <Button
                            variant="primary"
                            leftIcon={<Lock className="size-4" />}
                            loading={closeAll.isPending}
                            disabled={!periodEnded}
                            title={periodEnded ? undefined : "O período ainda está em andamento"}
                            onClick={() => void confirmCloseAll()}
                        >
                            Fechar espelhos do período
                        </Button>
                    ) : null}
                </div>
                <div className="px-1.5">
                    <CrudTabList<Bucket>
                        className="!px-1"
                        ariaLabel="Filtro de espelhos"
                        value={bucket}
                        onChange={setBucket}
                        items={[
                            { value: "ALL", label: "Todos" },
                            { value: "PENDING", label: "Com pendências", help: "Dias incompletos, sem registro ou com ajuste aguardando decisão." },
                            { value: "CLOSED", label: "Fechados", help: "Espelhos com as marcações travadas." },
                        ]}
                    />
                </div>
                <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                    <QueryPagedTablePanel<Row>
                        key={`${period.from}-${period.to}-${bucket}-${regime.overtime}-${regime.bank}`}
                        queryKey={[...timeManagementKeys.timesheets, period.from, period.to, bucket]}
                        request={async (page, size, filters) => {
                            const result = await timeManagementService.timesheets(period.from, period.to);
                            const rows = result.rows
                                .filter((row) =>
                                    bucket === "PENDING"
                                        ? row.pendingCount > 0
                                        : bucket === "CLOSED"
                                          ? row.closingStatus === "CLOSED"
                                          : true,
                                )
                                .map((row) => ({
                                    ...row,
                                    pendingLabel:
                                        row.pendingCount === 0 ? "Em dia" : row.pendingCount === 1 ? "1 dia" : `${row.pendingCount} dias`,
                                }));
                            return paginateCatalogRows(rows, page, size, filters);
                        }}
                        columns={columns(regime.overtime, regime.bank)}
                        rowKey="id"
                        emptyMessage={
                            bucket === "PENDING" ? "Ninguém com pendência no período." : "Nenhum espelho nesta visão."
                        }
                        onRowActivate={(row) => setSelected(row.collaboratorId)}
                        renderActions={(row) => (
                            <TableActionButton
                                actionVariant="open"
                                aria-label="Ver espelho"
                                title="Ver espelho"
                                leftIcon={<Eye className="size-3.5" />}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    setSelected(row.collaboratorId);
                                }}
                            />
                        )}
                    />
                </div>
            </div>
            <TimesheetDetailModal
                collaboratorId={selected}
                from={period.from}
                to={period.to}
                onClose={() => setSelected(null)}
            />
        </WorkspacePage>
    );
}

export default TimesheetPage;
