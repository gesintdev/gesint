"use client";

import {useMutation, useQuery, useQueryClient} from "@tanstack/react-query";
import {Eye} from "lucide-react";
import {useEffect, useMemo, useState} from "react";
import {toast} from "sonner";

import {attendancerecordKeys,attendanceSettingsKeys} from "@/modules/gp/attendance/attendance.query";
import {AttendancePeriodDateFilters} from "@/modules/gp/attendance/components/AttendancePeriodDateFilters";
import {buildAttendanceTableColumns} from "@/modules/gp/attendance/config/attendance-record.table-columns";
import type {AttendancePresenceRow} from "@/modules/gp/attendance/dto/attendance-record.dto";
import {ATTENDANCE_CLIENT_MESSAGES} from "@/modules/gp/attendance/exceptions/attendance-record.messages";
import {
    clearAttendanceCollaboratorFocus,
    writeAttendanceCollaboratorFocus,
} from "@/modules/gp/attendance/lib/attendance-collaborator-focus";
import {
    currentMonthBounds,
    normalizePeriod,
} from "@/modules/gp/attendance/lib/attendance-period.util";
import {writeAttendanceListPeriod} from "@/modules/gp/attendance/lib/attendance-period-focus";
import {
    type AttendancePresenceListingRow,
    coerceTimeHm,
    paginatePresenceRows,
} from "@/modules/gp/attendance/lib/attendance-presence.filters";
import {attendancerecordService} from "@/modules/gp/attendance/services/attendance-record.service";
import {useCrudListToolbar, useCrudScreen} from "@/shared/components/crud/CrudScreen";
import {CrudTableActions} from "@/shared/components/crud/CrudTableActions";
import {TableActionButton} from "@/shared/components/crud/TableActionButton";
import {QueryPagedTablePanel} from "@/shared/components/data/DataPanel";
import {ExceptionCapture} from "@/shared/exceptions";
import {SystemAlert} from "@/shared/system-alert";
import {registerTabCloseHandler} from "@/shared/workspace/dirty-tab-guard";
import {useWorkspaceTabOptional} from "@/shared/workspace/WorkspaceTabContext";

function presenceTags(row: AttendancePresenceRow): string[] {
    const tags: string[] = [];
    if (row.inVacation) tags.push("IN_VACATION");
    if (row.onLeaveActive) tags.push("ON_LEAVE");
    if (row.pendingAdjustmentRequest) tags.push("PENDING_ADJUSTMENT");
    return tags;
}

function isRealRecord(row: AttendancePresenceRow) {
    return row.hasRecord && !row.id.startsWith("absent:");
}

function toListingRow(row: AttendancePresenceRow): AttendancePresenceListingRow {
    const clockIn = coerceTimeHm(row.clockIn) || undefined;
    const breakStart = coerceTimeHm(row.breakStart) || undefined;
    const breakEnd = coerceTimeHm(row.breakEnd) || undefined;
    const clockOut = coerceTimeHm(row.clockOut) || undefined;
    const normalized = {
        ...row,
        clockIn,
        breakStart,
        breakEnd,
        clockOut,
    };
    const pending = row.pendingCount ?? 0;
    return {
        ...normalized,
        presenceTags: presenceTags(normalized),
        pendingLabel: pending === 0 ? "Em dia" : pending === 1 ? "1 dia" : `${pending} dias`,
    };
}

export function AttendanceRecordListClient() {
    const {startCreate} = useCrudScreen();
    const queryClient = useQueryClient();
    const workspaceTab = useWorkspaceTabOptional();
    const [dateFrom, setDateFrom] = useState(() => currentMonthBounds().from);
    const [dateTo, setDateTo] = useState(() => currentMonthBounds().to);
    const period = useMemo(() => normalizePeriod(dateFrom, dateTo), [dateFrom, dateTo]);
    const settingsQuery = useQuery({
        queryKey: attendanceSettingsKeys.all,
        queryFn: () => attendancerecordService.getSettings(),
        staleTime: 60_000,
    });
    const overtimeEnabled = settingsQuery.data?.overtimeEnabled ?? false;
    const hourBankEnabled = settingsQuery.data?.hourBankEnabled ?? true;
    const columns = useMemo(
        () => buildAttendanceTableColumns({overtimeEnabled, hourBankEnabled}),
        [overtimeEnabled, hourBankEnabled],
    );

    useEffect(() => {
        writeAttendanceListPeriod(period);
    }, [period]);

    const periodFilters = useMemo(
        () => (
            <AttendancePeriodDateFilters
                dateFrom={dateFrom}
                dateTo={dateTo}
                onDateFromChange={setDateFrom}
                onDateToChange={setDateTo}
            />
        ),
        [dateFrom, dateTo],
    );
    useCrudListToolbar(periodFilters);

    useEffect(() => {
        const tabId = workspaceTab?.tab.id;
        if (!tabId) return;
        return registerTabCloseHandler(tabId, () => {
            clearAttendanceCollaboratorFocus();
        });
    }, [workspaceTab?.tab.id]);

    const deleteMutation = useMutation({
        mutationFn: (id: string) => attendancerecordService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: attendancerecordKeys.all});
            toast.success("Registro de ponto excluído(a)");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, {fallbackMessage: ATTENDANCE_CLIENT_MESSAGES.ATTENDANCE_LOAD_FAILED}),
    });

    const handleDelete = async (row: AttendancePresenceRow) => {
        if (!isRealRecord(row)) return;
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    const openCollaboratorHistory = (row: AttendancePresenceRow) => {
        writeAttendanceCollaboratorFocus({
            collaboratorId: row.collaboratorId,
            collaboratorName: row.collaboratorName,
        });
        startCreate();
    };

    return (
        <QueryPagedTablePanel<AttendancePresenceListingRow>
            key={`${period.from}-${period.to}-${overtimeEnabled}-${hourBankEnabled}`}
            queryKey={[...attendancerecordKeys.all, "presence", "schedule", period.from, period.to]}
            paginationMode="load-more"
            request={async (page, size, filters) => {
                const rows = await attendancerecordService.listPresence(period.from, period.to);
                const enriched = rows.map(toListingRow);
                return paginatePresenceRows(enriched, page, size, filters);
            }}
            columns={columns}
            rowKey="id"
            emptyMessage="Nenhum colaborador encontrado para o período."
            onRowActivate={openCollaboratorHistory}
            renderActions={(row) =>
                isRealRecord(row) ? (
                    <CrudTableActions
                        row={row}
                        onEdit={() => openCollaboratorHistory(row)}
                        onDelete={() => void handleDelete(row)}
                        deleteLoading={
                            deleteMutation.isPending && deleteMutation.variables === row.id
                        }
                    />
                ) : (
                    <TableActionButton
                        actionVariant="open"
                        aria-label="Abrir histórico do colaborador"
                        title="Abrir histórico"
                        leftIcon={<Eye className="size-3.5"/>}
                        onClick={(event) => {
                            event.stopPropagation();
                            openCollaboratorHistory(row);
                        }}
                    />
                )
            }
        />
    );
}
