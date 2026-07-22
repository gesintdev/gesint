"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { JOB_VACANCY_APPLICATION_TABLE_COLUMNS } from "@/modules/rh/person/jobvacancyapplication/config/job-vacancy-application.table-columns";
import type { JobVacancyApplication } from "@/modules/rh/person/jobvacancyapplication/dto/job-vacancy-application.dto";
import { JOB_VACANCY_APPLICATION_CLIENT_MESSAGES } from "@/modules/rh/person/jobvacancyapplication/exceptions/job-vacancy-application.messages";
import { jobVacancyApplicationKeys } from "@/modules/rh/person/jobvacancyapplication/job-vacancy-application.query";
import { jobVacancyApplicationService } from "@/modules/rh/person/jobvacancyapplication/services/job-vacancy-application.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

export function JobVacancyApplicationListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();
    const deleteMutation = useMutation({
        mutationFn: (id: string) => jobVacancyApplicationService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: jobVacancyApplicationKeys.all });
            toast.success("Candidatura excluída");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, {
                fallbackMessage: JOB_VACANCY_APPLICATION_CLIENT_MESSAGES.JOB_VACANCY_APPLICATION_LOAD_FAILED,
            }),
    });
    const handleDelete = async (row: JobVacancyApplication) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <QueryTablePanel<JobVacancyApplication>
            queryKey={jobVacancyApplicationKeys.all}
            request={() => jobVacancyApplicationService.getAll()}
            columns={JOB_VACANCY_APPLICATION_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhuma candidatura cadastrada."
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
