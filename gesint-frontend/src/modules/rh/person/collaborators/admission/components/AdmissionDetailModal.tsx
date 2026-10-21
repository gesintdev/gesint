"use client";

import { useQuery } from "@tanstack/react-query";
import { X } from "lucide-react";
import { type ReactNode, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { jobpositionService } from "@/modules/dp/organization/jobposition/services/jobposition.service";
import type { AdmissionProcess } from "@/modules/rh/person/collaborators/admission/dto/admission-process.dto";
import { isAdmissionPj } from "@/modules/rh/person/collaborators/admission/lib/admission-contract.util";
import {
    ADMISSION_FORM_STEPS,
    ADMISSION_STATUS_LABELS,
    contractTypeLabel,
} from "@/modules/rh/person/collaborators/admission/lib/admission-form.constants";
import { formatCnpj, formatCpf } from "@/shared/lib/table/format-cell-value";

/** Etapas obrigatórias do progresso de admissão (alinhado ao backend). */
const REQUIRED_ADMISSION_STEP_IDS = new Set([
    "dados-basicos",
    "contatos-emergencia",
    "endereco",
    "documentos",
    "vinculo",
    "contrato",
]);

function formatDateBr(value?: string): string {
    if (!value) return "—";
    const [year, month, day] = value.slice(0, 10).split("-");
    if (!year || !month || !day) return "—";
    return `${day}/${month}/${year}`;
}

function missingAdmissionStepLabels(completedStepIds?: string[]): string[] {
    const completed = new Set(completedStepIds ?? []);
    return ADMISSION_FORM_STEPS.filter(
        (step) => REQUIRED_ADMISSION_STEP_IDS.has(step.id) && !completed.has(step.id),
    ).map((step) => step.label);
}

function DetailField({
    label,
    value,
    className,
    children,
}: {
    label: string;
    value?: string | null;
    className?: string;
    children?: ReactNode;
}) {
    return (
        <div
            className={`min-w-0 rounded-lg border border-base-content/8 bg-base-200/30 px-3 py-2${className ? ` ${className}` : ""}`}
        >
            <p className="text-[11px] font-medium uppercase tracking-wide text-base-content/45">{label}</p>
            {children ?? (
                <p className="mt-0.5 whitespace-pre-wrap text-sm text-base-content">{value || "—"}</p>
            )}
        </div>
    );
}

type AdmissionDetailModalProps = {
    row: AdmissionProcess | null;
    open: boolean;
    onClose: () => void;
};

export function AdmissionDetailModal({ row, open, onClose }: AdmissionDetailModalProps) {
    const dialogRef = useRef<HTMLDialogElement>(null);
    const [mounted, setMounted] = useState(false);

    const jobPositionQuery = useQuery({
        queryKey: ["job-position-summary", row?.jobPositionId],
        queryFn: () => jobpositionService.getById(row!.jobPositionId!),
        enabled: open && Boolean(row?.jobPositionId?.trim()),
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open) {
            dialog.showModal();
        } else if (dialog.open) {
            dialog.close();
        }
    }, [open]);

    if (!mounted || !row) {
        return null;
    }

    const isPj = isAdmissionPj(row.contractType);
    const pendingSteps = missingAdmissionStepLabels(row.completedStepIds);

    return createPortal(
        <dialog
            ref={dialogRef}
            className="modal"
            onClose={onClose}
            onClick={(event) => {
                if (event.target === event.currentTarget) onClose();
            }}
        >
            <div className="modal-box flex max-h-[92vh] w-full max-w-2xl flex-col gap-0 p-0">
                <div className="flex items-start justify-between gap-3 border-b border-base-content/10 px-5 py-4">
                    <div className="min-w-0">
                        <h4 className="text-base font-semibold text-base-content">
                            Admissão #{row.code}
                        </h4>
                        <p className="mt-1 truncate text-sm text-base-content/65">
                            {row.fullName?.trim() || "Colaborador"}
                        </p>
                        <span className="badge badge-ghost mt-2">
                            {ADMISSION_STATUS_LABELS[row.admissionStatus] ?? row.admissionStatus}
                        </span>
                    </div>
                    <button
                        type="button"
                        className="btn btn-ghost btn-sm btn-square"
                        aria-label="Fechar"
                        onClick={onClose}
                    >
                        <X className="size-4" />
                    </button>
                </div>

                <div className="overflow-y-auto px-5 py-4">
                    <section className="grid gap-2 sm:grid-cols-2">
                        <DetailField label="Etapas pendentes" className="sm:col-span-2">
                            <div className="mt-1.5 flex flex-wrap gap-1.5">
                                {pendingSteps.length === 0 ? (
                                    <span className="gesint-badge gesint-badge--success">
                                        Todas as etapas concluídas
                                    </span>
                                ) : (
                                    pendingSteps.map((label) => (
                                        <span key={label} className="gesint-badge gesint-badge--warning">
                                            {label}
                                        </span>
                                    ))
                                )}
                            </div>
                        </DetailField>
                        <DetailField label="Nome" value={row.fullName?.trim()} />
                        <DetailField label="CPF" value={row.cpf?.trim() ? formatCpf(row.cpf) : null} />
                        <DetailField label="Contrato" value={contractTypeLabel(row.contractType)} />
                        {isPj ? (
                            <>
                                <DetailField
                                    label="CNPJ"
                                    value={row.providerCnpj?.trim() ? formatCnpj(row.providerCnpj) : null}
                                />
                                <DetailField
                                    label="Razão social"
                                    value={row.providerLegalName?.trim()}
                                />
                            </>
                        ) : null}
                        <DetailField label="Departamento" value={row.departmentName?.trim()} />
                        <DetailField
                            label="Cargo"
                            value={jobPositionQuery.data?.title?.trim()}
                        />
                        <DetailField label="Data início" value={formatDateBr(row.expectedStartDate)} />
                    </section>
                </div>
            </div>
        </dialog>,
        document.body,
    );
}
