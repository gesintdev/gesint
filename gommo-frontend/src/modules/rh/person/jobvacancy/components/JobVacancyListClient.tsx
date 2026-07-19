"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { JOB_VACANCY_TABLE_COLUMNS } from "@/modules/rh/person/jobvacancy/config/job-vacancy.table-columns";
import type { JobVacancy } from "@/modules/rh/person/jobvacancy/dto/job-vacancy.dto";
import { JOB_VACANCY_CLIENT_MESSAGES } from "@/modules/rh/person/jobvacancy/exceptions/job-vacancy.messages";
import { jobVacancyKeys } from "@/modules/rh/person/jobvacancy/jobvacancy.query";
import { jobVacancyService } from "@/modules/rh/person/jobvacancy/services/jobvacancy.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

export function JobVacancyListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();
    const deleteMutation = useMutation({
        mutationFn: (id: string) => jobVacancyService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: jobVacancyKeys.all });
            toast.success("Vaga excluída");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: JOB_VACANCY_CLIENT_MESSAGES.JOB_VACANCY_LOAD_FAILED }),
    });
    const handleDelete = async (row: JobVacancy) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <QueryTablePanel<JobVacancy>
            queryKey={jobVacancyKeys.all}
            request={() => jobVacancyService.getAll()}
            columns={JOB_VACANCY_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhuma vaga cadastrada."
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
