"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DEPARTMENT_CLIENT_MESSAGES } from "@/modules/department/exceptions/department.messages";
import { DEPARTMENT_TABLE_COLUMNS } from "@/modules/department/config/department.table-columns";
import type { Department } from "@/modules/department/dto/department.dto";
import { departmentKeys } from "@/modules/department/department.query";
import { departmentService } from "@/modules/department/services/department.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { OpenInWorkspaceTabButton } from "@/shared/components/workspace/OpenInWorkspaceTabButton";
import { Button } from "@/shared/components/ui/Button";
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
                <>
                    <OpenInWorkspaceTabButton row={row} />
                    <Button variant="ghost" size="sm" aria-label="Editar" leftIcon={<Pencil className="size-3.5" />} onClick={() => startEdit(row.id, row)} />
                    <Button variant="ghost" size="sm" aria-label="Excluir" className="text-error hover:bg-error/10" leftIcon={<Trash2 className="size-3.5" />} loading={deleteMutation.isPending && deleteMutation.variables === row.id} onClick={() => handleDelete(row)} />
                </>
            )}
        />
    );
}
