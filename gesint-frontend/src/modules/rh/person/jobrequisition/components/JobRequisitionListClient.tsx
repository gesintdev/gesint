"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { JOB_REQUISITION_TABLE_COLUMNS } from "@/modules/rh/person/jobrequisition/config/job-requisition.table-columns";
import type { JobRequisition } from "@/modules/rh/person/jobrequisition/dto/job-requisition.dto";
import { JOB_REQUISITION_CLIENT_MESSAGES } from "@/modules/rh/person/jobrequisition/exceptions/job-requisition.messages";
import { jobRequisitionKeys } from "@/modules/rh/person/jobrequisition/job-requisition.query";
import { jobRequisitionService } from "@/modules/rh/person/jobrequisition/services/job-requisition.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { QueryPagedTablePanel } from "@/shared/components/data/DataPanel";
import { ExceptionCapture } from "@/shared/exceptions";
import { paginateCatalogRows } from "@/shared/lib/table/paginate-catalog-rows";
import { SystemAlert } from "@/shared/system-alert";

export function JobRequisitionListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();
    const deleteMutation = useMutation({
        mutationFn: (id: string) => jobRequisitionService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: jobRequisitionKeys.all });
            toast.success("Requisição excluída");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, {
                fallbackMessage: JOB_REQUISITION_CLIENT_MESSAGES.JOB_REQUISITION_DELETE_FAILED,
            }),
    });
    const handleDelete = async (row: JobRequisition) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <QueryPagedTablePanel<JobRequisition>
            queryKey={jobRequisitionKeys.all}
            request={async (page, size, filters) =>
                paginateCatalogRows(await jobRequisitionService.getAll(), page, size, filters)
            }
            columns={JOB_REQUISITION_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhuma requisição de vaga cadastrada."
            onRowActivate={(row) => startEdit(row.id, row)}
            renderActions={(row) => (
                <CrudTableActions
                    row={row}
                    onEdit={() => startEdit(row.id, row)}
                    onDelete={() => void handleDelete(row)}
                    deleteDisabled={row.requisitionStatus === "APPROVED"}
                    deleteDisabledTitle="Requisição aprovada não pode ser excluída"
                    deleteLoading={deleteMutation.isPending && deleteMutation.variables === row.id}
                />
            )}
        />
    );
}
