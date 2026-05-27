"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ATTENDANCE_CLIENT_MESSAGES } from "@/modules/attendance/exceptions/attendance-record.messages";
import { ATTENDANCE_TABLE_COLUMNS } from "@/modules/attendance/config/attendance-record.table-columns";
import type { AttendanceRecord } from "@/modules/attendance/dto/attendance-record.dto";
import { attendancerecordKeys } from "@/modules/attendance/attendance.query";
import { attendancerecordService } from "@/modules/attendance/services/attendance-record.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { OpenInWorkspaceTabButton } from "@/shared/components/workspace/OpenInWorkspaceTabButton";
import { Button } from "@/shared/components/ui/Button";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

export function AttendanceRecordListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();

    const deleteMutation = useMutation({
        mutationFn: (id: string) => attendancerecordService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: attendancerecordKeys.all });
            toast.success("Registro de ponto excluído(a)");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: ATTENDANCE_CLIENT_MESSAGES.ATTENDANCE_LOAD_FAILED }),
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
                <>
                    <OpenInWorkspaceTabButton row={row} />
                    <Button variant="ghost" size="sm" aria-label="Editar" leftIcon={<Pencil className="size-3.5" />} onClick={() => startEdit(row.id, row)} />
                    <Button variant="ghost" size="sm" aria-label="Excluir" className="text-error hover:bg-error/10" leftIcon={<Trash2 className="size-3.5" />} loading={deleteMutation.isPending && deleteMutation.variables === row.id} onClick={() => handleDelete(row)} />
                </>
            )}
        />
    );
}
