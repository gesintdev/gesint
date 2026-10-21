"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { candidateKeys } from "@/modules/rh/person/candidate/candidate.query";
import { CANDIDATE_TABLE_COLUMNS } from "@/modules/rh/person/candidate/config/candidate.table-columns";
import type { Candidate } from "@/modules/rh/person/candidate/dto/candidate.dto";
import { CANDIDATE_CLIENT_MESSAGES } from "@/modules/rh/person/candidate/exceptions/candidate.messages";
import { candidateService } from "@/modules/rh/person/candidate/services/candidate.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { useCrudStatusActions } from "@/shared/components/crud/useCrudStatusActions";
import { QueryPagedTablePanel } from "@/shared/components/data/DataPanel";
import { ExceptionCapture } from "@/shared/exceptions";
import {
    CATALOG_STATUS_INITIAL_FILTERS,
    loadActiveAndInactiveRows,
    paginateCatalogRows,
} from "@/shared/lib/table/paginate-catalog-rows";
import { SystemAlert } from "@/shared/system-alert";

export function CandidateListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();
    const { activateMutation, deactivateMutation, handleActivate, handleDeactivate } = useCrudStatusActions({
        service: candidateService,
        queryKey: candidateKeys.all,
        entityLabel: "Candidato",
    });
    const deleteMutation = useMutation({
        mutationFn: (id: string) => candidateService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: candidateKeys.all });
            toast.success("Candidato excluído");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: CANDIDATE_CLIENT_MESSAGES.CANDIDATE_LOAD_FAILED }),
    });
    const handleDelete = async (row: Candidate) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <QueryPagedTablePanel<Candidate>
            queryKey={candidateKeys.all}
            initialFilters={CATALOG_STATUS_INITIAL_FILTERS}
            request={async (page, size, filters) => {
                const rows = await loadActiveAndInactiveRows((options) => candidateService.getAll(options));
                return paginateCatalogRows(rows, page, size, filters);
            }}
            columns={CANDIDATE_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhum candidato cadastrado."
            onRowActivate={(row) => startEdit(row.id, row)}
            renderActions={(row) => (
                <CrudTableActions
                    row={row}
                    onEdit={() => startEdit(row.id, row)}
                    onDelete={() => void handleDelete(row)}
                    deleteLoading={deleteMutation.isPending && deleteMutation.variables === row.id}
                    onActivate={() => handleActivate(row.id)}
                    onDeactivate={() => void handleDeactivate(row.id)}
                    activateLoading={activateMutation.isPending && activateMutation.variables === row.id}
                    deactivateLoading={deactivateMutation.isPending && deactivateMutation.variables === row.id}
                />
            )}
        />
    );
}
