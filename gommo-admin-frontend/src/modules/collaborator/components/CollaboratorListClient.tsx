"use client";
import { collaboratorKeys } from "@/modules/collaborator/collaborator.query";
import { COLLABORATOR_TABLE_COLUMNS } from "@/modules/collaborator/config/collaborator.table-columns";
import type { Collaborator } from "@/modules/collaborator/dto/collaborator.dto";
import { collaboratorService } from "@/modules/collaborator/services/collaborator.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";

export function CollaboratorListClient() {
    const { startEdit } = useCrudScreen();

    return (
        <QueryTablePanel<Collaborator>
            queryKey={collaboratorKeys.all}
            request={() => collaboratorService.getAll()}
            columns={COLLABORATOR_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhum colaborador cadastrado. Utilize Nova Admissão para incluir pessoas no sistema."
            onRowActivate={(row) => startEdit(row.id, row)}
            renderActions={(row) => (
                <CrudTableActions
                    row={row}
                    onEdit={() => startEdit(row.id, row)}
                    editAriaLabel="Editar dados pessoais"
                />
            )}
        />
    );
}
