"use client";

import {use} from "react";
import {COLLABORATOR_TABLE_COLUMNS} from "@/modules/collaborator/config/collaborator.table-columns";
import type {Collaborator} from "@/modules/collaborator/dto/collaborator.dto";
import {DataTable} from "@/shared/components/ui/DataTable";

type CollaboratorAsyncSectionProps = {
    promise: Promise<Collaborator[]>;
};

/** Client boundary para `use()` + tabela — use dentro de Suspense no servidor. */
export function CollaboratorAsyncSection({promise}: CollaboratorAsyncSectionProps) {
    const collaborators = use(promise);
    return (
        <DataTable<Collaborator>
            data={collaborators}
            columns={COLLABORATOR_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhum colaborador cadastrado."
        />
    );
}
