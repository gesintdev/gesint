"use client";

import type {VacationPeriodContext} from "@/modules/person/vacation/types/vacation.types";
import {CollaboratorPickerField} from "@/shared/components/crud/CollaboratorPickerField";

const STATUS_LABEL: Record<VacationPeriodContext["status"], string> = {
    ACQUIRING: "Em aquisição",
    AVAILABLE: "Direito adquirido",
    CONCESSIVE: "Período concessivo",
    EXPIRED: "Férias vencidas",
    FORFEITED: "Sem direito",
};

type Props = {
    context: VacationPeriodContext | null;
    loading?: boolean;
    collaboratorId: string;
    onCollaboratorChange: (collaboratorId: string) => void;
    collaboratorError?: string;
};

function formatRange(start: string | undefined, end: string | undefined): string {
    if (!start || !end) return "—";
    return `${start.split("-").reverse().join("/")} → ${end.split("-").reverse().join("/")}`;
}

export function VacationPeriodSummary({
                                          context,
                                          loading,
                                          collaboratorId,
                                          onCollaboratorChange,
                                          collaboratorError,
                                      }: Props) {
    const gridClass = "grid w-full grid-cols-1 gap-2 sm:grid-cols-2 sm:grid-rows-4 sm:gap-2";

    if (loading) {
        return (
            <div className={gridClass}>
                <div className="skeleton-shimmer col-span-1 h-10 rounded-lg sm:col-span-2"/>
                <div className="skeleton-shimmer col-span-1 h-16 rounded-lg sm:col-span-2"/>
                {Array.from({length: 4}).map((_, i) => (
                    <div key={i} className="skeleton-shimmer h-16 rounded-lg"/>
                ))}
            </div>
        );
    }

    const periodLabel =
        context?.periodIndex != null && context.periodIndex > 0
            ? `${context.periodIndex + 1}º período aquisitivo em foco`
            : null;

    const entitledDays = context?.entitledDays ?? 0;

    return (
        <div className={gridClass}>
            <div className="col-span-1 sm:col-span-2">
                <CollaboratorPickerField
                    value={collaboratorId}
                    onValueChange={onCollaboratorChange}
                    required
                    error={collaboratorError}
                />
            </div>

            {context?.contractType === "CLT" && !context.hireDate ? (
                <p className="col-span-1 text-sm text-warning sm:col-span-2">
                    Não encontramos data de início na admissão concluída nem no contrato de trabalho. Informe a data no
                    vínculo ou no contrato para calcular os períodos.
                </p>
            ) : null}

            <div className="col-span-1 rounded-lg border border-base-300/60 bg-base-200/30 p-3 sm:col-span-2">
                <p className="text-xs font-medium uppercase tracking-wide text-base-content/55">Data de início</p>
                <p className="mt-1 text-sm font-medium text-base-content">
                    {context?.hireDate ? context.hireDate.split("-").reverse().join("/") : "—"}
                    {periodLabel ? (
                        <span className="mt-1 block text-xs font-normal text-base-content/60">{periodLabel}</span>
                    ) : null}
                </p>
            </div>

            <div className="rounded-lg border border-base-300/60 bg-base-200/30 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-base-content/55">Período aquisitivo</p>
                <p className="mt-1 text-sm font-medium text-base-content">
                    {formatRange(context?.acquisition?.start, context?.acquisition?.end)}
                </p>
            </div>

            <div className="rounded-lg border border-base-300/60 bg-base-200/30 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-base-content/55">Período concessivo</p>
                <p className="mt-1 text-sm font-medium text-base-content">
                    {formatRange(context?.concessive?.start, context?.concessive?.end)}
                </p>
            </div>

            <div className="rounded-lg border border-base-300/60 bg-base-200/30 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-base-content/55">Dias de direito</p>
                <p className="mt-1 text-sm font-medium text-base-content">{entitledDays} dias</p>
            </div>

            <div className="rounded-lg border border-base-300/60 bg-base-200/30 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-base-content/55">Situação</p>
                {context?.status === "EXPIRED" ? (
                    <p className="mt-2 text-xs text-error">
                        Período concessivo vencido: risco de pagamento em dobro (art. 137 CLT).
                    </p>
                ) : (
                    <p className="mt-1 text-sm font-medium text-base-content">
                        {context ? STATUS_LABEL[context.status] : "—"}
                    </p>
                )}
            </div>
        </div>
    );
}
