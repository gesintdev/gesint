"use client";

import { useQuery } from "@tanstack/react-query";
import { type ReactNode } from "react";

import { jobpositionService } from "@/modules/dp/organization/jobposition/services/jobposition.service";
import type { AdmissionProcess } from "@/modules/rh/person/collaborators/admission/dto/admission-process.dto";
import { isAdmissionPj } from "@/modules/rh/person/collaborators/admission/lib/admission-contract.util";
import {
    ADMISSION_FORM_STEPS,
    ADMISSION_STATUS_LABELS,
    contractTypeLabel,
    experiencePeriodLabel,
} from "@/modules/rh/person/collaborators/admission/lib/admission-form.constants";
import { Modal } from "@/shared/components/ui/Modal";
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
    const jobPositionQuery = useQuery({
        queryKey: ["job-position-summary", row?.jobPositionId],
        queryFn: () => jobpositionService.getById(row!.jobPositionId!),
        enabled: open && Boolean(row?.jobPositionId?.trim()),
    });

    if (!row) {
        return null;
    }

    const isPj = isAdmissionPj(row.contractType);
    const pendingSteps = missingAdmissionStepLabels(row.completedStepIds);

    return (
        <Modal
            open={open}
            onClose={onClose}
            title={`Admissão #${row.code}`}
            subtitle={
                <span className="grid gap-1.5">
                    <span className="truncate text-sm text-base-content/65">
                        {row.fullName?.trim() || "Colaborador"}
                    </span>
                    <span className="badge badge-ghost w-fit">
                        {ADMISSION_STATUS_LABELS[row.admissionStatus] ?? row.admissionStatus}
                    </span>
                </span>
            }
            size="xl"
        >
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
                        {row.contractType === "CLT" ? (
                            <DetailField
                                label="Período de experiência"
                                value={experiencePeriodLabel(row.experiencePeriod)}
                            />
                        ) : null}
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
        </Modal>
    );
}
