"use client";

import {useMutation, useQueryClient} from "@tanstack/react-query";
import {toast} from "sonner";

import {attendancerecordKeys} from "@/modules/rh/person/attendance/attendance.query";
import {ATTENDANCE_TABLE_COLUMNS} from "@/modules/rh/person/attendance/config/attendance-record.table-columns";
import type {AttendanceRecord} from "@/modules/rh/person/attendance/dto/attendance-record.dto";
import {ATTENDANCE_CLIENT_MESSAGES} from "@/modules/rh/person/attendance/exceptions/attendance-record.messages";
import {attendancerecordService} from "@/modules/rh/person/attendance/services/attendance-record.service";
import {useCrudScreen} from "@/shared/components/crud/CrudScreen";
import {CrudTableActions} from "@/shared/components/crud/CrudTableActions";
import {QueryTablePanel} from "@/shared/components/data/DataPanel";
import {ExceptionCapture} from "@/shared/exceptions";
import {SystemAlert} from "@/shared/system-alert";

export function AttendanceRecordListClient() {
    const {startEdit} = useCrudScreen();
    const queryClient = useQueryClient();
    const deleteMutation = useMutation({
        mutationFn: (id: string) => attendancerecordService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({queryKey: attendancerecordKeys.all});
            toast.success("Registro de ponto excluído(a)");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, {fallbackMessage: ATTENDANCE_CLIENT_MESSAGES.ATTENDANCE_LOAD_FAILED}),
    });
    const handleDelete = async (row: AttendanceRecord) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <QueryTablePanel<AttendanceRecord>
            queryKey={attendancerecordKeys.all}
            request={() => attendancerecordService.getAll()}
            columns={ATTENDANCE_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhum(a) registro de ponto cadastrado(a)."
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
