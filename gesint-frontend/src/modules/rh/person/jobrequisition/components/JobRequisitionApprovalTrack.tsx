"use client";

import clsx from "clsx";

import type { JobRequisition, JobRequisitionStatus } from "@/modules/rh/person/jobrequisition/dto/job-requisition.dto";
import { isoToDateBr } from "@/shared/lib/input/date";

type StepTone = "done" | "current" | "rejected" | "idle";

type ApprovalStep = {
    key: string;
    label: string;
    detail: string;
    tone: StepTone;
};

const BAR_CLASS: Record<StepTone, string> = {
    done: "bg-success",
    current: "bg-info",
    rejected: "bg-error",
    idle: "bg-base-content/12",
};

const LABEL_CLASS: Record<StepTone, string> = {
    done: "text-base-content/75",
    current: "text-info font-semibold",
    rejected: "text-error font-semibold",
    idle: "text-base-content/45",
};

const STAGE_ORDER: JobRequisitionStatus[] = ["PENDING_MANAGER", "PENDING_HR", "PENDING_DIRECTOR"];

function decisionDetail(name?: string | null, at?: string | null, fallback = "aprovado"): string {
    const date = at ? isoToDateBr(at.slice(0, 10)).slice(0, 5) : "";
    return [name, date].filter(Boolean).join(" · ") || fallback;
}

function stageTone(requisition: JobRequisition, stage: JobRequisitionStatus): StepTone {
    const status = requisition.requisitionStatus;
    if (status === "REJECTED" && requisition.rejectedStage === stage) return "rejected";
    if (status === stage) return "current";
    if (status === "APPROVED") return "done";
    const currentIndex = STAGE_ORDER.indexOf(status);
    const stageIndex = STAGE_ORDER.indexOf(stage);
    if (currentIndex > stageIndex) return "done";
    if (status === "REJECTED" && requisition.rejectedStage) {
        return STAGE_ORDER.indexOf(requisition.rejectedStage) > stageIndex ? "done" : "idle";
    }
    return "idle";
}

function stageDetail(requisition: JobRequisition, stage: JobRequisitionStatus, tone: StepTone, fallback: string) {
    if (tone === "rejected") return decisionDetail(requisition.rejectedByName, requisition.rejectedAt, "reprovado");
    if (tone === "current") return "pendente";
    if (tone !== "done") return fallback;
    if (stage === "PENDING_MANAGER") return decisionDetail(requisition.managerApprovedByName, requisition.managerApprovedAt);
    if (stage === "PENDING_HR") return decisionDetail(requisition.hrApprovedByName, requisition.hrApprovedAt);
    return decisionDetail(requisition.directorApprovedByName, requisition.directorApprovedAt);
}

function buildSteps(requisition: JobRequisition | null, outOfBand: boolean): ApprovalStep[] {
    const stages: Array<{ stage: JobRequisitionStatus; label: string; fallback: string }> = [
        { stage: "PENDING_MANAGER", label: "Gestor", fallback: "" },
        { stage: "PENDING_HR", label: "RH", fallback: "" },
    ];
    if (outOfBand) {
        stages.push({ stage: "PENDING_DIRECTOR", label: "Diretoria", fallback: "(fora da faixa)" });
    }

    const steps: ApprovalStep[] = stages.map(({ stage, label, fallback }) => {
        if (!requisition) return { key: stage, label, detail: fallback, tone: "idle" };
        const tone = stageTone(requisition, stage);
        return { key: stage, label, detail: stageDetail(requisition, stage, tone, fallback), tone };
    });

    const approved = requisition?.requisitionStatus === "APPROVED";
    steps.push({
        key: "vacancy",
        label: "Vaga aberta",
        detail: approved ? "gerada" : "",
        tone: approved ? "done" : "idle",
    });
    return steps;
}

type JobRequisitionApprovalTrackProps = {
    requisition: JobRequisition | null;
    outOfBand: boolean;
};

export function JobRequisitionApprovalTrack({ requisition, outOfBand }: JobRequisitionApprovalTrackProps) {
    const steps = buildSteps(requisition, outOfBand);

    return (
        <div className="grid gap-3 sm:col-span-12">
            <div className="flex gap-2">
                {steps.map((step) => (
                    <div key={step.key} className="min-w-0 flex-1">
                        <div className={clsx("h-[5px] rounded-full", BAR_CLASS[step.tone])} />
                        <div className={clsx("mt-1.5 truncate text-xs", LABEL_CLASS[step.tone])}>{step.label}</div>
                        <div className="truncate text-[11px] text-base-content/45">{step.detail || "\u00a0"}</div>
                    </div>
                ))}
            </div>
            {requisition?.requisitionStatus === "REJECTED" && requisition.rejectionReason ? (
                <p className="text-xs text-error">
                    <strong className="font-semibold">Motivo da reprovação:</strong> {requisition.rejectionReason}
                </p>
            ) : null}
            {requisition?.requisitionStatus === "CANCELED" ? (
                <p className="text-xs text-base-content/55">Requisição cancelada.</p>
            ) : null}
        </div>
    );
}
