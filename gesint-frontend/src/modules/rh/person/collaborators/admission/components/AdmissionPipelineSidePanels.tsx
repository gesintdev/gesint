"use client";

import clsx from "clsx";
import { AlertTriangle } from "lucide-react";

import type {
    AdmissionPipelineBlock,
    AdmissionPipelineDeadline,
} from "@/modules/rh/person/collaborators/admission/dto/admission-pipeline.dto";
import {
    blockDescription,
    blockTitle,
    deadlineLegalBasis,
    deadlineTitle,
    deadlineWhenLabel,
    shortDateBr,
} from "@/modules/rh/person/collaborators/admission/lib/admission-pipeline.labels";
import { Card } from "@/shared/components/ui/Card";

/**
 * Cada painel cresce com o próprio conteúdo até um teto e então rola por dentro, em vez de dividir
 * uma altura emprestada da esteira. Com poucas admissões os dois aparecem inteiros; com muitas,
 * nenhum deles engole o outro. O cabeçalho fica fora da área rolável e continua visível.
 */
const PANEL_CLASS = "flex min-h-0 flex-col";
const PANEL_BODY_CLASS = "max-h-[40vh] min-h-0 overflow-y-auto !p-0";

export function AdmissionPipelineDeadlines({ deadlines }: { deadlines: AdmissionPipelineDeadline[] }) {
    return (
        <Card
            animate={false}
            className={PANEL_CLASS}
            bodyClassName={PANEL_BODY_CLASS}
            title="Prazos legais"
            subtitle="próximos 30 dias"
        >
            {deadlines.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-base-content/50">Nenhum prazo no horizonte.</p>
            ) : (
                deadlines.map((deadline) => (
                    <div
                        key={`${deadline.admissionId}-${deadline.kind}`}
                        className="flex items-start gap-3 border-b border-(--gesint-border-subtle) px-4 py-3 last:border-b-0"
                    >
                        <span
                            className={clsx(
                                "w-14 shrink-0 pt-px text-[10.5px] font-medium tabular-nums",
                                deadline.overdue ? "font-semibold text-error" : "text-base-content/55",
                            )}
                        >
                            {deadlineWhenLabel(deadline.daysFromToday, deadline.dueDate)}
                        </span>
                        <div className="min-w-0">
                            <div className="text-[12px] leading-tight font-medium text-base-content">
                                {deadlineTitle(deadline.kind)}
                            </div>
                            <div className="mt-1 truncate text-[10.5px] text-base-content/45">
                                {deadline.fullName}
                                {deadline.overdue ? ` · venceu ${shortDateBr(deadline.dueDate)}` : ""}
                            </div>
                            <div className="mt-1 text-[9.5px] text-base-content/40">
                                {deadlineLegalBasis(deadline.kind)}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </Card>
    );
}

export function AdmissionPipelineBlocks({ blocks }: { blocks: AdmissionPipelineBlock[] }) {
    return (
        <Card
            animate={false}
            className={PANEL_CLASS}
            bodyClassName={PANEL_BODY_CLASS}
            title="Bloqueios ativos"
            subtitle="impedem o início"
        >
            {blocks.length === 0 ? (
                <p className="px-4 py-8 text-center text-sm text-base-content/50">Nenhum bloqueio ativo.</p>
            ) : (
                blocks.map((block) => (
                    <div
                        key={`${block.admissionId}-${block.reason}`}
                        className="flex items-start gap-3 border-b border-(--gesint-border-subtle) px-4 py-3.5 last:border-b-0"
                    >
                        <span className="flex size-[22px] shrink-0 items-center justify-center rounded-md bg-error/12 text-error">
                            <AlertTriangle className="size-3.5" strokeWidth={2.25} />
                        </span>
                        <div className="min-w-0">
                            <div className="text-[12px] font-semibold text-base-content">{block.fullName}</div>
                            <div className="mt-1 text-[10.5px] leading-relaxed text-base-content/60">
                                <span className="font-medium text-base-content/75">{blockTitle(block.reason)}.</span>{" "}
                                {blockDescription(block)}
                            </div>
                        </div>
                    </div>
                ))
            )}
        </Card>
    );
}
