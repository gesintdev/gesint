"use client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { DEPARTMENT_TABLE_COLUMNS } from "@/modules/dp/organization/department/config/department.table-columns";
import { departmentKeys } from "@/modules/dp/organization/department/department.query";
import type { Department } from "@/modules/dp/organization/department/dto/department.dto";
import { DEPARTMENT_CLIENT_MESSAGES } from "@/modules/dp/organization/department/exceptions/department.messages";
import { departmentService } from "@/modules/dp/organization/department/services/department.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

export function DepartmentListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();
    const deleteMutation = useMutation({
        mutationFn: (id: string) => departmentService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: departmentKeys.all });
            toast.success("Departamento excluído(a)");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: DEPARTMENT_CLIENT_MESSAGES.DEPARTMENT_LOAD_FAILED }),
    });
    const handleDelete = async (row: Department) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <QueryTablePanel<Department>
            queryKey={departmentKeys.all}
            request={() => departmentService.getAll()}
            columns={DEPARTMENT_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhum(a) departamento cadastrado(a)."
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
