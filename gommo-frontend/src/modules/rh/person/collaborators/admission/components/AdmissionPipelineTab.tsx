"use client";

import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";

import { admissionprocessKeys } from "@/modules/rh/person/collaborators/admission/admission.query";
import { AdmissionPipelineKpis } from "@/modules/rh/person/collaborators/admission/components/AdmissionPipelineKpis";
import {
    AdmissionPipelineBlocks,
    AdmissionPipelineDeadlines,
} from "@/modules/rh/person/collaborators/admission/components/AdmissionPipelineSidePanels";
import { AdmissionPipelineTrack } from "@/modules/rh/person/collaborators/admission/components/AdmissionPipelineTrack";
import { ADMISSION_CLIENT_MESSAGES } from "@/modules/rh/person/collaborators/admission/exceptions/admission-process.messages";
import { admissionPipelineService } from "@/modules/rh/person/collaborators/admission/services/admission-pipeline.service";
import { useCrudScreen } from "@/shared/components/crud/CrudScreen";
import { Button } from "@/shared/components/ui/Button";
import { ExceptionCapture } from "@/shared/exceptions";

const DEFAULT_PAGE_SIZE = 10;

export function AdmissionPipelineTab() {
    const { startCreate, startEdit } = useCrudScreen();
    const [page, setPage] = useState(0);
    const [size, setSize] = useState(DEFAULT_PAGE_SIZE);

    const summaryQuery = useQuery({
        queryKey: [...admissionprocessKeys.all, "pipeline", "summary"],
        queryFn: () => admissionPipelineService.summary(),
    });
    const pageQuery = useQuery({
        queryKey: [...admissionprocessKeys.all, "pipeline", "page", page, size],
        queryFn: () => admissionPipelineService.getPage(page, size),
        placeholderData: (previous) => previous,
    });

    const error = summaryQuery.error ?? pageQuery.error;
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
                <Button size="sm" leftIcon={<Plus className="size-3.5" strokeWidth={2.5} />} onClick={startCreate}>
                    Nova admissão
                </Button>
            </div>

            <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto p-1.5">
                {summary ? (
                    <AdmissionPipelineKpis kpis={summary.kpis} />
                ) : (
                    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
                        {Array.from({ length: 5 }).map((_, index) => (
                            <div key={index} className="skeleton-shimmer h-[104px] rounded-xl" />
                        ))}
                    </div>
                )}

                <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_23rem]">
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
                    />
                    {/*
                      A coluna absoluta não entra no cálculo de altura da linha, então a régua passa a
                      ser só o card da esteira. `inset-0` devolve exatamente essa altura aos painéis.
                      Abaixo de xl o layout empilha e os painéis voltam a crescer com o conteúdo.
                    */}
                    <div className="relative">
                        <div className="flex flex-col gap-3 xl:absolute xl:inset-0">
                            <AdmissionPipelineDeadlines deadlines={summary?.deadlines ?? []} />
                            <AdmissionPipelineBlocks blocks={summary?.blocks ?? []} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
