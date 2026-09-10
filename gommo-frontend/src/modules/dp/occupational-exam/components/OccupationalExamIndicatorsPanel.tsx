"use client";

import { useQuery } from "@tanstack/react-query";

import { OCCUPATIONAL_EXAM_CLIENT_MESSAGES } from "@/modules/dp/occupational-exam/exceptions/occupational-exam.messages";
import { occupationalExamKeys } from "@/modules/dp/occupational-exam/occupational-exam.query";
import { occupationalExamService } from "@/modules/dp/occupational-exam/services/occupational-exam.service";
import { ExceptionCapture } from "@/shared/exceptions";

function MetricCard({
    label,
    value,
    hint,
    tone = "neutral",
}: {
    label: string;
    value: string;
    hint?: string;
    tone?: "neutral" | "warning" | "error" | "success";
}) {
    const toneClass =
        tone === "error"
            ? "border-error/40 text-error"
            : tone === "warning"
              ? "border-warning/40 text-warning"
              : tone === "success"
                ? "border-success/40 text-success"
                : "border-base-300 text-base-content";
    return (
        <div className={`rounded-box border bg-base-100 px-3 py-2 ${toneClass}`}>
            <p className="text-xs text-base-content/60">{label}</p>
            <p className="text-lg font-semibold tabular-nums">{value}</p>
            {hint ? <p className="mt-0.5 text-[11px] text-base-content/50">{hint}</p> : null}
        </div>
    );
}

function formatPercent(value?: number | null) {
    if (value == null) return "—";
    return `${value.toFixed(1)}%`;
}

// Mesmo recuo que o QueryPagedTablePanel aplica em volta da tabela, para os cards
// alinharem com as bordas dela em vez de vazarem para as laterais do painel.
const ROW_CLASS = "mb-4 grid gap-2 px-1.5 pt-1.5 sm:grid-cols-2 lg:grid-cols-4";

export function OccupationalExamIndicatorsPanel() {
    const query = useQuery({
        queryKey: occupationalExamKeys.indicators,
        queryFn: () => occupationalExamService.indicators(),
    });

    if (query.isLoading) {
        return (
            <div className={ROW_CLASS}>
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton-shimmer h-16 rounded-box" />
                ))}
            </div>
        );
    }

    if (query.isError) {
        return (
            <p className="mb-4 px-1.5 pt-1.5 text-sm text-error">
                {ExceptionCapture.displayMessage(query.error, OCCUPATIONAL_EXAM_CLIENT_MESSAGES.LOAD_FAILED)}
            </p>
        );
    }

    const data = query.data;
    if (!data) return null;

    return (
        <div className={ROW_CLASS}>
            <MetricCard
                label="Conformidade"
                value={formatPercent(data.complianceRatePercent)}
                hint={`${data.compliantCollaborators}/${data.activeCollaboratorsWithPosition} colaboradores`}
                tone={
                    data.complianceRatePercent != null && data.complianceRatePercent < 80 ? "warning" : "success"
                }
            />
            <MetricCard
                label="Cobertura da matriz"
                value={formatPercent(data.matrixCoveragePercent)}
                hint={`${data.jobPositionsWithMatrix}/${data.activeJobPositions} funcoes`}
            />
            <MetricCard
                label="Vencidos / 30 dias"
                value={`${data.overdueCount} / ${data.dueIn30Count}`}
                hint={`60d: ${data.dueIn60Count} · 90d: ${data.dueIn90Count}`}
                tone={data.overdueCount > 0 ? "error" : "neutral"}
            />
            <MetricCard
                label="Demissionais pendentes"
                value={String(data.dismissalPendingCount)}
                hint="Exigiveis fora do prazo de 10 dias"
                tone={data.dismissalPendingCount > 0 ? "error" : "neutral"}
            />
        </div>
    );
}
