"use client";

import clsx from "clsx";
import { AlertTriangle, Info } from "lucide-react";

import { maskCurrencyFromCents } from "@/shared/lib/input/currency";

type JobRequisitionSalaryBandProps = {
    levelLabel?: string;
    proposed?: number | null;
    min?: number | null;
    max?: number | null;
};

export function formatBrl(value: number): string {
    return maskCurrencyFromCents(String(Math.round(value * 100)));
}

function percent(value: number, lo: number, hi: number): number {
    if (hi <= lo) return 0;
    return Math.min(100, Math.max(0, ((value - lo) / (hi - lo)) * 100));
}

export function JobRequisitionSalaryBand({ levelLabel, proposed, min, max }: JobRequisitionSalaryBandProps) {
    if (min == null || max == null) {
        return (
            <div className="flex items-start gap-2 rounded-lg border border-(--gommo-border-subtle) px-3 py-2.5 text-xs text-base-content/60 sm:col-span-12">
                <Info className="mt-px size-3.5 shrink-0" strokeWidth={2} />
                <span>
                    {levelLabel
                        ? "O cargo não tem tabela salarial vigente para este nível; a alçada segue o fluxo dentro da faixa."
                        : "Selecione o nível para confrontar o salário com a faixa do cargo."}
                </span>
            </div>
        );
    }

    const span = max - min || max * 0.1 || 1;
    const lo = Math.max(0, Math.min(min, proposed ?? min) - span * 0.5);
    const hi = Math.max(max, proposed ?? max) + span * 0.5;
    const above = proposed != null && proposed > max;
    const below = proposed != null && proposed < min;
    const deviation = above ? ((proposed - max) / max) * 100 : below ? ((min - proposed) / min) * 100 : 0;
    const deviationLabel = deviation.toLocaleString("pt-BR", { maximumFractionDigits: 1 });

    return (
        <div className="grid gap-3 sm:col-span-12">
            <div>
                <div className="relative h-2 rounded-full bg-base-content/8">
                    <div
                        className="absolute inset-y-0 rounded-full bg-success/45"
                        style={{ left: `${percent(min, lo, hi)}%`, right: `${100 - percent(max, lo, hi)}%` }}
                    />
                    {proposed != null ? (
                        <div
                            className={clsx(
                                "absolute -top-1 h-4 w-1 -translate-x-1/2 rounded-full",
                                above || below ? "bg-warning" : "bg-primary",
                            )}
                            style={{ left: `${percent(proposed, lo, hi)}%` }}
                            title={formatBrl(proposed)}
                        />
                    ) : null}
                </div>
                <div className="mt-1.5 flex justify-between gap-2 text-[11px] text-base-content/50">
                    <span>{formatBrl(lo)}</span>
                    <span className="font-medium text-base-content/70">
                        Faixa{levelLabel ? ` nível ${levelLabel}` : ""}: {formatBrl(min)} – {formatBrl(max)}
                    </span>
                    <span>{formatBrl(hi)}</span>
                </div>
            </div>

            {above || below ? (
                <div className="gommo-alert-banner gommo-alert-banner--warning items-center rounded-lg !py-2.5 !pe-4">
                    <AlertTriangle className="size-4 shrink-0 text-warning" strokeWidth={2} />
                    <p className="text-xs text-base-content/80">
                        {above ? "Acima do máximo" : "Abaixo do mínimo"} da faixa ({above ? "+" : "-"}
                        {deviationLabel}%). Exige aprovação da <strong>Diretoria</strong> e justificativa.
                    </p>
                </div>
            ) : null}
        </div>
    );
}
