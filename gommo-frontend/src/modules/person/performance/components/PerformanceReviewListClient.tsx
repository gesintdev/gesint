"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { PERFORMANCE_TABLE_COLUMNS } from "@/modules/person/performance/config/performance-review.table-columns";
import type { PerformanceReview } from "@/modules/person/performance/dto/performance-review.dto";
import { PERFORMANCE_CLIENT_MESSAGES } from "@/modules/person/performance/exceptions/performance-review.messages";
import { performanceReviewKeys } from "@/modules/person/performance/performance.query";
import { performanceReviewService } from "@/modules/person/performance/services/performance-review.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { QueryTablePanel } from "@/shared/components/data/DataPanel";
import { OpenInWorkspaceTabButton } from "@/shared/components/workspace/OpenInWorkspaceTabButton";
import { Button } from "@/shared/components/ui/Button";
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
                <>
                    <OpenInWorkspaceTabButton row={row} />
                    <Button variant="ghost" size="sm" aria-label="Editar" leftIcon={<Pencil className="size-3.5" />} onClick={() => startEdit(row.id, row)} />
                    <Button variant="ghost" size="sm" aria-label="Excluir" className="text-error hover:bg-error/10" leftIcon={<Trash2 className="size-3.5" />} loading={deleteMutation.isPending && deleteMutation.variables === row.id} onClick={() => handleDelete(row)} />
                </>
            )}
        />
    );
}
