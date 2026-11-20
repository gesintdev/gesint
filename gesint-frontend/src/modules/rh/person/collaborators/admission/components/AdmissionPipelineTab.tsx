"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";

import { admissionprocessKeys } from "@/modules/rh/person/collaborators/admission/admission.query";
import { AdmissionPipelineKpis } from "@/modules/rh/person/collaborators/admission/components/AdmissionPipelineKpis";
import {
    AdmissionPipelineBlocks,
    AdmissionPipelineDeadlines,
} from "@/modules/rh/person/collaborators/admission/components/AdmissionPipelineSidePanels";
import { AdmissionPipelineTrack } from "@/modules/rh/person/collaborators/admission/components/AdmissionPipelineTrack";
import type { AdmissionPipelineRow } from "@/modules/rh/person/collaborators/admission/dto/admission-pipeline.dto";
import { ADMISSION_CLIENT_MESSAGES } from "@/modules/rh/person/collaborators/admission/exceptions/admission-process.messages";
import { admissionPipelineService } from "@/modules/rh/person/collaborators/admission/services/admission-pipeline.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { Button } from "@/shared/components/ui/Button";
import { ExceptionCapture } from "@/shared/exceptions";
import { useBranchScopedQueryKey } from "@/shared/hooks/useBranchScopedQueryKey";

const DEFAULT_PAGE_SIZE = 10;

export function AdmissionPipelineTab() {
    const { startCreate, startEdit } = useCrudScreen();
    const queryClient = useQueryClient();
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(DEFAULT_PAGE_SIZE);
    const summaryQueryKey = useBranchScopedQueryKey([...admissionprocessKeys.pipeline, "summary"]);
    const pageQueryKey = useBranchScopedQueryKey([...admissionprocessKeys.pipeline, "page", page, size]);

    const summaryQuery = useQuery({
        queryKey: summaryQueryKey,
        queryFn: () => admissionPipelineService.summary(),
    });
    const pageQuery = useQuery({
        queryKey: pageQueryKey,
        queryFn: () => admissionPipelineService.getPage(page, size),
    });

    const error = summaryQuery.error ?? pageQuery.error;
    const loading = summaryQuery.isPending || pageQuery.isPending;

    const handleApprove = async (row: AdmissionPipelineRow) => {
        await admissionPipelineService.approve(row.admissionId);
        await Promise.all([
            queryClient.invalidateQueries({ queryKey: summaryQueryKey }),
            queryClient.invalidateQueries({ queryKey: pageQueryKey }),
            queryClient.invalidateQueries({ queryKey: admissionprocessKeys.all }),
        ]);
    };

    if (loading) {
        return (
            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-1.5">
                <div className="grid shrink-0 gap-2 sm:grid-cols-2 xl:grid-cols-5">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="skeleton-shimmer h-(--gesint-control-h) rounded-[length:var(--gesint-control-radius)]" />
                    ))}
                </div>
                <div className="skeleton-shimmer min-h-0 flex-1 rounded-xl" />
            </div>
        );
    }

    if (error) {
        return (
            <p className="px-4 py-6 text-sm text-error">
                {ExceptionCapture.displayMessage(error, ADMISSION_CLIENT_MESSAGES.ADMISSION_LOAD_FAILED)}
            </p>
        );
    }

    const summary = summaryQuery.data;
    const pageData = pageQuery.data;

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
            {/* Mesmas classes da toolbar da Listagem para o botão cair na altura do "Novo cadastro". */}
            <div className="crud-list-toolbar flex flex-wrap items-center justify-end gap-2 border-b px-4 py-1.5">
                <Button leftIcon={<Plus className="size-4" strokeWidth={2} />} onClick={startCreate}>
                    Nova admissão
                </Button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden p-1.5">
                {summary ? (
                    <div className="shrink-0">
                        <AdmissionPipelineKpis kpis={summary.kpis} />
                    </div>
                ) : (
                    <div className="grid shrink-0 gap-2 sm:grid-cols-2 xl:grid-cols-5">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div
                                key={index}
                                className="skeleton-shimmer h-(--gesint-control-h) rounded-[length:var(--gesint-control-radius)]"
                            />
                        ))}
                    </div>
                )}

                <div className="grid min-h-0 flex-1 items-stretch gap-3 xl:grid-cols-[minmax(0,1fr)_18rem]">
                    <AdmissionPipelineTrack
                        rows={pageData?.content ?? []}
                        page={pageData?.page ?? page}
                        size={pageData?.size ?? size}
                        totalPages={pageData?.totalPages ?? 0}
                        totalElements={pageData?.totalElements ?? 0}
                        loading={pageQuery.isFetching}
                        onPageChange={setPage}
                        onPageSizeChange={(nextSize) => {
                            setSize(nextSize);
                            setPage(0);
                        }}
                        onOpen={(row) => startEdit(row.admissionId, { fullName: row.fullName })}
                        onApprove={handleApprove}
                    />
                    <div className="flex min-h-0 flex-col gap-3 overflow-y-auto">
                        <AdmissionPipelineDeadlines deadlines={summary?.deadlines ?? []} />
                        <AdmissionPipelineBlocks blocks={summary?.blocks ?? []} />
                    </div>
                </div>
            </div>
        </div>
    );
}
