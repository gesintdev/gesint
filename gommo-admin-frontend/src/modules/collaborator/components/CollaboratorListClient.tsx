"use client";

import { Pencil } from "lucide-react";
import { COLLABORATOR_TABLE_COLUMNS } from "@/modules/collaborator/config/collaborator.table-columns";
import type { Collaborator } from "@/modules/collaborator/dto/collaborator.dto";
import { collaboratorKeys } from "@/modules/collaborator/collaborator.query";
import { collaboratorService } from "@/modules/collaborator/services/collaborator.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { OpenInWorkspaceTabButton } from "@/shared/components/workspace/OpenInWorkspaceTabButton";
import { Button } from "@/shared/components/ui/Button";

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
                <>
                    <OpenInWorkspaceTabButton row={row} />
                    <Button
                        variant="ghost"
                        size="sm"
                        aria-label="Editar dados pessoais"
                        leftIcon={<Pencil className="size-3.5" />}
                        onClick={() => startEdit(row.id, row)}
                    />
                </>
            )}
        />
    );
}
