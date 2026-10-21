"use client";

import clsx from "clsx";
import { type KeyboardEvent, type MouseEvent } from "react";
import { toast } from "sonner";

import type {
    AdmissionPipelineRow,
    AdmissionPipelineStep,
} from "@/modules/rh/person/collaborators/admission/dto/admission-pipeline.dto";
import {
    type PipelineTone,
    approveConfirmMessage,
    rowMessage,
    rowSubtitle,
    signalLabel,
    signalTone,
    stepLabel,
    stepTone,
} from "@/modules/rh/person/collaborators/admission/lib/admission-pipeline.labels";
import { TablePagination } from "@/shared/components/data/TablePagination";
import { Card } from "@/shared/components/ui/Card";
import { ProfileAvatar } from "@/shared/components/ui/ProfileAvatar";
import { ExceptionCapture } from "@/shared/exceptions";
import { SystemAlert } from "@/shared/system-alert/system-alert";

const BAR_CLASS: Record<PipelineTone, string> = {
    neutral: "bg-base-content/12",
    info: "bg-info",
    success: "bg-success",
    warning: "bg-warning",
    error: "bg-error",
};

const BAR_LABEL_CLASS: Record<PipelineTone, string> = {
    neutral: "text-base-content/40",
    info: "text-info font-semibold",
    success: "text-base-content/55",
    warning: "text-warning font-semibold",
    error: "text-error font-semibold",
};

const PILL_CLASS: Record<PipelineTone, string> = {
    neutral: "bg-base-content/8 text-base-content/60",
    info: "bg-info/12 text-info",
    success: "bg-success/12 text-success",
    warning: "bg-warning/14 text-warning",
    error: "bg-error/12 text-error",
};

function StepSegment({ step }: { step: AdmissionPipelineStep }) {
    const tone = stepTone(step);
    const label = stepLabel(step);
    return (
        <div className="min-w-0 flex-1" title={step.blockedReason ?? step.skipJustification ?? label}>
            <div className={clsx("h-[5px] rounded-full", BAR_CLASS[tone])} />
            <div className={clsx("mt-1.5 truncate text-[9.5px] tracking-tight", BAR_LABEL_CLASS[tone])}>{label}</div>
        </div>
    );
}

function PipelineRow({
    row,
    onOpen,
    onApprove,
}: {
    row: AdmissionPipelineRow;
    onOpen: (row: AdmissionPipelineRow) => void;
    onApprove: (row: AdmissionPipelineRow) => Promise<void>;
}) {
    const tone = signalTone(row.signal);
    const canApprove = !row.manuallyApproved && row.signal !== "APROVADA";

    const handleApproveClick = async (event: MouseEvent | KeyboardEvent) => {
        event.stopPropagation();
        event.preventDefault();
        if (!canApprove) return;

        const confirmed = await SystemAlert.confirm({
            title: "Aprovar admissão",
            message: approveConfirmMessage(row),
            variant: "warning",
            confirmLabel: "Aprovar mesmo assim",
            cancelLabel: "Cancelar",
        });
        if (!confirmed) return;

        try {
            await onApprove(row);
            toast.success("Admissão aprovada");
        } catch (error) {
            toast.error(ExceptionCapture.displayMessage(error, "Não foi possível aprovar a admissão"));
        }
    };

    return (
        <div
            role="button"
            tabIndex={0}
            onClick={() => onOpen(row)}
            onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    onOpen(row);
                }
            }}
            className={clsx(
                "grid cursor-pointer items-center gap-4 border-b border-(--gesint-border-subtle) px-4 py-3.5 transition-colors last:border-b-0",
                "grid-cols-1 lg:grid-cols-[minmax(0,15rem)_minmax(0,1fr)_minmax(0,11.5rem)]",
                // A urgência já é sinalizada pela pílula e pelas barras; o fundo fica só para o hover.
                "hover:bg-base-200/40",
            )}
        >
            <div className="flex min-w-0 items-center gap-2.5">
                <ProfileAvatar
                    name={row.fullName}
                    photoObjectId={row.photoObjectId}
                    size="md"
                    fallback="initials"
                />
                <div className="min-w-0">
                    <div className="truncate text-[12.5px] font-semibold text-base-content">{row.fullName}</div>
                    <div className="mt-0.5 truncate text-[10.5px] text-base-content/45">{rowSubtitle(row)}</div>
                </div>
            </div>

            <div className="min-w-0 overflow-x-auto lg:overflow-visible">
                <div className="flex min-w-max gap-1.5 lg:min-w-0">
                    {row.steps.map((step) => (
                        <StepSegment key={step.stepKey} step={step} />
                    ))}
                </div>
            </div>

            <div className="lg:text-right">
                <button
                    type="button"
                    disabled={!canApprove}
                    title={canApprove ? "Aprovar admissão manualmente" : undefined}
                    onClick={handleApproveClick}
                    onKeyDown={(event) => {
                        if (event.key === "Enter" || event.key === " ") {
                            void handleApproveClick(event);
                        }
                    }}
                    className={clsx(
                        "inline-block rounded-md px-2 py-1 text-[10px] font-bold tracking-wide uppercase transition-opacity",
                        PILL_CLASS[tone],
                        canApprove ? "cursor-pointer hover:opacity-80" : "cursor-default",
                    )}
                >
                    {signalLabel(row.signal)}
                </button>
                <p className="mt-1.5 text-[11px] leading-snug text-base-content/60">{rowMessage(row)}</p>
            </div>
        </div>
    );
}

function LegendItem({ className, label }: { className: string; label: string }) {
    return (
        <span className="inline-flex items-center gap-1.5">
            <i className={clsx("inline-block h-1 w-4 rounded-full not-italic", className)} />
            {label}
        </span>
    );
}

type AdmissionPipelineTrackProps = {
    rows: AdmissionPipelineRow[];
    page: number;
    size: number;
    totalPages: number;
    totalElements: number;
    loading: boolean;
    onPageChange: (page: number) => void;
    onPageSizeChange: (size: number) => void;
    onOpen: (row: AdmissionPipelineRow) => void;
    onApprove: (row: AdmissionPipelineRow) => Promise<void>;
};

export function AdmissionPipelineTrack({
    rows,
    page,
    size,
    totalPages,
    totalElements,
    loading,
    onPageChange,
    onPageSizeChange,
    onOpen,
    onApprove,
}: AdmissionPipelineTrackProps) {
    return (
        <Card
            animate={false}
            bodyClassName="!p-0"
            title="Esteira de admissão"
            subtitle={`${totalElements} ${totalElements === 1 ? "pessoa" : "pessoas"} · ordenado por urgência`}
        >
            {rows.length === 0 ? (
                <p className="px-4 py-10 text-center text-sm text-base-content/50">
                    Nenhuma admissão em andamento.
                </p>
            ) : (
                rows.map((row) => (
                    <PipelineRow key={row.admissionId} row={row} onOpen={onOpen} onApprove={onApprove} />
                ))
            )}

            <div className="flex flex-wrap gap-4 border-t border-(--gesint-border-subtle) px-4 py-3 text-[10.5px] text-base-content/45">
                <LegendItem className="bg-success" label="Concluída" />
                <LegendItem className="bg-info" label="Em andamento" />
                <LegendItem className="bg-error" label="Bloqueada ou vencida" />
                <LegendItem className="bg-base-content/12" label="Não iniciada" />
            </div>

            <TablePagination
                page={page}
                size={size}
                totalPages={totalPages}
                totalElements={totalElements}
                loading={loading}
                onPageChange={onPageChange}
                onPageSizeChange={onPageSizeChange}
            />
        </Card>
    );
}
