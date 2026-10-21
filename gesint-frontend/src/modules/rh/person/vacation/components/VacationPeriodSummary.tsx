import clsx from "clsx";
import { CalendarRange } from "lucide-react";
import { type ReactNode, useMemo, useState } from "react";

import { VacationAcquisitionPeriodModal } from "@/modules/rh/person/vacation/components/VacationAcquisitionPeriodModal";
import {
    daysUntilDate,
    listAcquisitionPeriodOptions,
} from "@/modules/rh/person/vacation/lib/vacation-rules";
import type { VacationPeriodContext, VacationPeriodStatus } from "@/modules/rh/person/vacation/types/vacation.types";
import { CollaboratorPickerField } from "@/shared/components/crud/CollaboratorPickerField";
import { Button } from "@/shared/components/ui/Button";

const STATUS_LABEL: Record<VacationPeriodStatus, string> = {
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
    /** Troca o período aquisitivo em foco (início ISO do período). */
    onAcquisitionPeriodChange?: (acquisitionStart: string) => void;
};

function formatDate(iso: string | undefined | null): string {
    if (!iso) return "—";
    return iso.split("-").reverse().join("/");
}

function formatRange(start: string | undefined, end: string | undefined): string {
    if (!start || !end) return "—";
    return `${formatDate(start)} → ${formatDate(end)}`;
}

function SummaryCard({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
    return (
        <div
            className={clsx(
                "flex h-full min-h-19 flex-col rounded-lg border border-base-300/60 bg-base-200/30 p-3",
                className,
            )}
        >
            <p className="text-xs font-medium uppercase tracking-wide text-base-content/55">{label}</p>
            <div className="mt-1 min-h-5.5 flex-1 text-sm font-medium leading-snug text-base-content">{children}</div>
        </div>
    );
}

function SummaryAlert({ children, tone }: { children: ReactNode; tone: "warning" | "error" }) {
    return (
        <p
            className={clsx(
                "col-span-1 rounded-lg border px-3 py-2 text-xs leading-relaxed sm:col-span-2",
                tone === "warning"
                    ? "border-warning/25 bg-warning/5 text-warning"
                    : "border-error/25 bg-error/5 text-error",
            )}
        >
            {children}
        </p>
    );
}

export function VacationPeriodSummary({
    context,
    loading,
    collaboratorId,
    onCollaboratorChange,
    collaboratorError,
    onAcquisitionPeriodChange,
}: Props) {
    const [selectorOpen, setSelectorOpen] = useState(false);
    const periodOptions = useMemo(() => {
        if (!context?.hireDate || context.contractType !== "CLT") return [];
        return listAcquisitionPeriodOptions(context.hireDate, context.unjustifiedAbsences);
    }, [context?.contractType, context?.hireDate, context?.unjustifiedAbsences]);

    const periodLabel =
        context?.periodIndex != null && context.periodIndex > 0
            ? `${context.periodIndex + 1}º período aquisitivo em foco`
            : context?.periodIndex === 0
              ? "1º período aquisitivo em foco"
              : null;
    const entitledDays = context?.entitledDays ?? 0;
    const concessiveEnd = context?.concessive?.end;
    const daysLeft =
        concessiveEnd && (context?.status === "CONCESSIVE" || context?.status === "AVAILABLE")
            ? daysUntilDate(concessiveEnd)
            : null;
    const daysOverdue = concessiveEnd && context?.status === "EXPIRED" ? Math.abs(daysUntilDate(concessiveEnd)) : null;
    const canSelectPeriod =
        Boolean(onAcquisitionPeriodChange) && Boolean(context?.hireDate) && context?.contractType === "CLT";

    return (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="col-span-1 sm:col-span-2">
                <CollaboratorPickerField
                    value={collaboratorId}
                    onValueChange={onCollaboratorChange}
                    required
                    error={collaboratorError}
                    disabled={loading}
                />
            </div>
            {loading ? (
                <>
                    <div className="skeleton-shimmer col-span-1 h-19 rounded-lg sm:col-span-2" />
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="skeleton-shimmer h-19 rounded-lg" />
                    ))}
                </>
            ) : (
                <>
                    {context?.contractType === "CLT" && !context.hireDate ? (
                        <SummaryAlert tone="warning">
                            Não encontramos data de início na admissão concluída nem no contrato de trabalho. Informe a
                            data no vínculo ou no contrato para calcular os períodos.
                        </SummaryAlert>
                    ) : null}
                    <div className="col-span-1 flex items-center justify-between gap-3 rounded-lg border border-base-300/60 bg-base-200/30 p-3 sm:col-span-2">
                        <div className="min-w-0">
                            <p className="text-xs font-medium uppercase tracking-wide text-base-content/55">
                                Data de início
                            </p>
                            <span className="mt-1 block text-sm font-medium leading-snug text-base-content">
                                {formatDate(context?.hireDate)}
                            </span>
                            {periodLabel ? (
                                <span className="mt-1 block text-xs font-normal text-base-content/60">
                                    {periodLabel}
                                </span>
                            ) : null}
                        </div>
                        {canSelectPeriod ? (
                            <Button
                                type="button"
                                variant="outline"
                                size="sm"
                                leftIcon={<CalendarRange className="size-3.5" />}
                                className="shrink-0"
                                onClick={() => setSelectorOpen(true)}
                                disabled={periodOptions.length === 0}
                            >
                                Período
                            </Button>
                        ) : null}
                    </div>
                    <SummaryCard label="Período aquisitivo">
                        <span className="block wrap-break-word">
                            {formatRange(context?.acquisition?.start, context?.acquisition?.end)}
                        </span>
                    </SummaryCard>
                    <SummaryCard label="Período concessivo">
                        <span className="block wrap-break-word">
                            {formatRange(context?.concessive?.start, context?.concessive?.end)}
                        </span>
                    </SummaryCard>
                    {daysLeft != null && daysLeft >= 0 ? (
                        <SummaryAlert tone="warning">
                            Prazo para concessão: {daysLeft} dia(s) restante(s) (até {formatDate(concessiveEnd)}). Após
                            o vencimento, risco de pagamento em dobro (art. 137 CLT).
                        </SummaryAlert>
                    ) : null}
                    <SummaryCard label="Dias de direito">
                        <span>{entitledDays} dias</span>
                    </SummaryCard>
                    <SummaryCard label="Situação">
                        <span>{context ? STATUS_LABEL[context.status] : "—"}</span>
                    </SummaryCard>
                    {context?.status === "EXPIRED" ? (
                        <SummaryAlert tone="error">
                            Período concessivo vencido
                            {daysOverdue != null ? ` há ${daysOverdue} dia(s)` : ""}: risco de pagamento em dobro (art.
                            137 CLT).
                        </SummaryAlert>
                    ) : null}
                </>
            )}
            {canSelectPeriod ? (
                <VacationAcquisitionPeriodModal
                    open={selectorOpen}
                    options={periodOptions}
                    selectedAcquisitionStart={context?.acquisition?.start}
                    onClose={() => setSelectorOpen(false)}
                    onSelect={(acquisitionStart) => onAcquisitionPeriodChange?.(acquisitionStart)}
                />
            ) : null}
        </div>
    );
}
