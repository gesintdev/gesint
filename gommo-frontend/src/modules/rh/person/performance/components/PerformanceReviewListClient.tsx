"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { PERFORMANCE_TABLE_COLUMNS } from "@/modules/rh/person/performance/config/performance-review.table-columns";
import type { PerformanceReview } from "@/modules/rh/person/performance/dto/performance-review.dto";
import { PERFORMANCE_CLIENT_MESSAGES } from "@/modules/rh/person/performance/exceptions/performance-review.messages";
import { performanceReviewKeys } from "@/modules/rh/person/performance/performance.query";
import { performanceReviewService } from "@/modules/rh/person/performance/services/performance-review.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { CrudTableActions } from "@/shared/components/crud/CrudTableActions";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert";

export function PerformanceReviewListClient() {
    const { startEdit } = useCrudScreen();
    const queryClient = useQueryClient();
    const deleteMutation = useMutation({
        mutationFn: (id: string) => performanceReviewService.remove(id),
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: performanceReviewKeys.all });
            toast.success("Avaliação excluída");
        },
        onError: (err: unknown) =>
            ExceptionCapture.handle(err, { fallbackMessage: PERFORMANCE_CLIENT_MESSAGES.PERFORMANCE_LOAD_FAILED }),
    });
    const handleDelete = async (row: PerformanceReview) => {
        if (!(await SystemAlert.confirmDelete())) return;
        deleteMutation.mutate(row.id);
    };

    return (
        <QueryTablePanel<PerformanceReview>
            queryKey={performanceReviewKeys.all}
            request={() => performanceReviewService.getAll()}
            columns={PERFORMANCE_TABLE_COLUMNS}
            rowKey="id"
            emptyMessage="Nenhuma avaliação de desempenho cadastrada."
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
