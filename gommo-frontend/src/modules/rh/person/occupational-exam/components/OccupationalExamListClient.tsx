"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { OccupationalExamIndicatorsPanel } from "@/modules/rh/person/occupational-exam/components/OccupationalExamIndicatorsPanel";
import { OCCUPATIONAL_EXAM_TABLE_COLUMNS } from "@/modules/rh/person/occupational-exam/config/occupational-exam.table-columns";
import type { OccupationalExam } from "@/modules/rh/person/occupational-exam/dto/occupational-exam.dto";
import { OCCUPATIONAL_EXAM_CLIENT_MESSAGES } from "@/modules/rh/person/occupational-exam/exceptions/occupational-exam.messages";
import { occupationalExamKeys } from "@/modules/rh/person/occupational-exam/occupational-exam.query";
import { occupationalExamService } from "@/modules/rh/person/occupational-exam/services/occupational-exam.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { QueryPagedTablePanel } from "@/shared/components/data/DataPanel";
import { paginateCatalogRows } from "@/shared/lib/table/paginate-catalog-rows";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

export function OccupationalExamListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();
    const deleteMutation = useMutation({
        mutationFn: (id: string) => occupationalExamService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: occupationalExamKeys.all });
            await queryClient.invalidateQueries({ queryKey: occupationalExamKeys.indicators });
            toast.success("Exame ocupacional excluido");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, {
                fallbackMessage: OCCUPATIONAL_EXAM_CLIENT_MESSAGES.DELETE_FAILED,
            }),
    });

    const handleDelete = async (row: OccupationalExam) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <div>
            <OccupationalExamIndicatorsPanel />
            <QueryPagedTablePanel<OccupationalExam>
                queryKey={occupationalExamKeys.all}
                request={async (page, size, filters) =>
                    paginateCatalogRows(await occupationalExamService.getAll(), page, size, filters)
                }
                columns={OCCUPATIONAL_EXAM_TABLE_COLUMNS}
                rowKey="id"
                emptyMessage="Nenhum exame ocupacional cadastrado."
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
        </div>
    );
}
