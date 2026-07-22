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
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

export function CandidateListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();
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
        <QueryTablePanel<Candidate>
            queryKey={candidateKeys.all}
            request={() => candidateService.getAll()}
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
                />
            )}
        />
    );
}
