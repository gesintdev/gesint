"use client";

import type { VacationPeriodContext } from "@/modules/person/vacation/types/vacation.types";

const STATUS_LABEL: Record<VacationPeriodContext["status"], string> = {
    ACQUIRING: "Em aquisição",
    AVAILABLE: "Direito adquirido",
    CONCESSIVE: "Período concessivo",
    EXPIRED: "Férias vencidas",
    FORFEITED: "Sem direito",
};

const STATUS_CLASS: Record<VacationPeriodContext["status"], string> = {
    ACQUIRING: "badge-ghost",
    AVAILABLE: "badge-success",
    CONCESSIVE: "badge-warning",
    EXPIRED: "badge-error",
    FORFEITED: "badge-error",
};

type Props = {
    context: VacationPeriodContext | null;
    loading?: boolean;
};

function formatRange(start: string | undefined, end: string | undefined): string {
    if (!start || !end) return "—";
    return `${start.split("-").reverse().join("/")} → ${end.split("-").reverse().join("/")}`;
}

export function VacationPeriodSummary({ context, loading }: Props) {
    if (loading) {
        return (
            <div className="grid gap-2 sm:grid-cols-2">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="skeleton-shimmer h-16 rounded-lg" />
                ))}
            </div>
        );
    }

    if (!context) return null;

    return (
        <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-base-300/60 bg-base-200/30 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-base-content/55">Período aquisitivo</p>
                <p className="mt-1 text-sm font-medium text-base-content">
                    {formatRange(context.acquisition?.start, context.acquisition?.end)}
                </p>
            </div>
            <div className="rounded-lg border border-base-300/60 bg-base-200/30 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-base-content/55">Período concessivo</p>
                <p className="mt-1 text-sm font-medium text-base-content">
                    {formatRange(context.concessive?.start, context.concessive?.end)}
                </p>
            </div>
            <div className="rounded-lg border border-base-300/60 bg-base-200/30 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-base-content/55">Dias de direito</p>
                <p className="mt-1 text-sm font-medium text-base-content">{context.entitledDays} dias</p>
            </div>
            <div className="rounded-lg border border-base-300/60 bg-base-200/30 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-base-content/55">Situação</p>
                <span className={`badge mt-2 ${STATUS_CLASS[context.status]}`}>{STATUS_LABEL[context.status]}</span>
                {context.status === "EXPIRED" ? (
                    <p className="mt-2 text-xs text-error">
                        Período concessivo vencido: risco de pagamento em dobro (art. 137 CLT).
                    </p>
                ) : null}
            </div>
        </div>
    );
}
