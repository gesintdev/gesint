"use client";

import { useQuery } from "@tanstack/react-query";
import type { AdmissionProcessCreateDto, AdmissionStatus } from "@/modules/person/collaborators/admission/dto/admission-process.dto";
import {
    ADMISSION_STATUS_LABELS,
    contractTypeLabel,
} from "@/modules/person/collaborators/admission/lib/admission-form.constants";
import {
    computeFilledAdmissionSteps,
    type AdmissionStepContext,
} from "@/modules/person/collaborators/admission/lib/admission-status.util";
import { departmentService } from "@/modules/organization/department/services/department.service";
import { jobpositionService } from "@/modules/organization/jobposition/services/jobposition.service";
import { formatCpf } from "@/shared/lib/table/format-cell-value";

type AdmissionSummaryProps = {
    form: AdmissionProcessCreateDto;
    stepIds: string[];
    context: AdmissionStepContext;
    entityCode?: number;
    status: AdmissionStatus;
};

function formatDateBr(value?: string): string {
    if (!value) return "—";
    const [year, month, day] = value.slice(0, 10).split("-");
    if (!year || !month || !day) return "—";
    return `${day}/${month}/${year}`;
}

function SummaryRow({
    label,
    value,
    emphasize,
}: {
    label: string;
    value: string;
    emphasize?: boolean;
}) {
    return (
        <p className="leading-snug text-base-content/75">
            <span className="text-base-content/45">{label}:</span>{" "}
            <span className={emphasize ? "font-medium text-primary" : "text-base-content/85"}>{value}</span>
        </p>
    );
}

export function AdmissionSummary({ form, stepIds, context, entityCode, status }: AdmissionSummaryProps) {
    const filledSteps = computeFilledAdmissionSteps(form, context, stepIds);
    const requiredCount = stepIds.filter((id) => id !== "observacoes").length;

    const departmentQuery = useQuery({
        queryKey: ["department-summary", form.departmentId],
        queryFn: () => departmentService.getById(form.departmentId!),
        enabled: Boolean(form.departmentId?.trim()),
    });

    const jobPositionQuery = useQuery({
        queryKey: ["job-position-summary", form.jobPositionId],
        queryFn: () => jobpositionService.getById(form.jobPositionId!),
        enabled: Boolean(form.jobPositionId?.trim()),
    });

    return (
        <div className="flex h-full min-h-0 w-full min-w-0 flex-col rounded-xl border border-base-content/10 bg-base-200/20 p-3 text-[11px] sm:max-w-[15rem]">
            {entityCode != null ? (
                <p className="mb-2 font-semibold uppercase tracking-wide text-base-content/45">
                    Admissão #{entityCode}
                </p>
            ) : null}
            <div className="grid flex-1 content-start gap-1.5">
                <SummaryRow
                    label="Andamento"
                    value={ADMISSION_STATUS_LABELS[status] ?? status}
                    emphasize
                />
                <SummaryRow
                    label="Etapas"
                    value={`${filledSteps.length} de ${requiredCount} concluídas`}
                />
                <SummaryRow label="Nome" value={form.fullName?.trim() || "—"} />
                <SummaryRow
                    label="CPF"
                    value={form.cpf?.trim() ? formatCpf(form.cpf) : "—"}
                />
                <SummaryRow
                    label="Contrato"
                    value={contractTypeLabel(form.contractType)}
                />
                <SummaryRow
                    label="Departamento"
                    value={departmentQuery.data?.name ?? "—"}
                />
                <SummaryRow
                    label="Cargo"
                    value={jobPositionQuery.data?.title ?? "—"}
                />
                <SummaryRow
                    label="Data início"
                    value={formatDateBr(form.expectedStartDate)}
                />
            </div>
        </div>
    );
}
