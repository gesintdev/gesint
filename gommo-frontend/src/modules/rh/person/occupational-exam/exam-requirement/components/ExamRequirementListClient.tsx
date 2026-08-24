"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { EXAM_REQUIREMENT_TABLE_COLUMNS } from "@/modules/rh/person/occupational-exam/exam-requirement/config/exam-requirement.table-columns";
import type { ExamRequirement } from "@/modules/rh/person/occupational-exam/exam-requirement/dto/exam-requirement.dto";
import { examRequirementKeys } from "@/modules/rh/person/occupational-exam/exam-requirement/exam-requirement.query";
import { examRequirementService } from "@/modules/rh/person/occupational-exam/exam-requirement/services/exam-requirement.service";
import { OCCUPATIONAL_EXAM_CLIENT_MESSAGES } from "@/modules/rh/person/occupational-exam/exceptions/occupational-exam.messages";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { QueryPagedTablePanel } from "@/shared/components/data/DataPanel";
import { paginateCatalogRows } from "@/shared/lib/table/paginate-catalog-rows";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

export function ExamRequirementListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();
    const deleteMutation = useMutation({
        mutationFn: (id: string) => examRequirementService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: examRequirementKeys.all });
            toast.success("Requisito de exame excluido");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, {
                fallbackMessage: OCCUPATIONAL_EXAM_CLIENT_MESSAGES.REQUIREMENT_DELETE_FAILED,
            }),
    });

    const handleDelete = async (row: ExamRequirement) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <QueryPagedTablePanel<ExamRequirement>
            queryKey={examRequirementKeys.all}
            request={async (page, size, filters) =>
                paginateCatalogRows(await examRequirementService.getAll(), page, size, filters)
            }
            columns={EXAM_REQUIREMENT_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhum requisito na matriz de exames."
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
