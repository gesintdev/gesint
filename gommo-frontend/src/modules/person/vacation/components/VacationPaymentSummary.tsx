"use client";

import type { VacationPaymentEstimate } from "@/modules/person/vacation/types/vacation.types";

type Props = {
    estimate: VacationPaymentEstimate | null;
};

function money(value: number): string {
    return value.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
}

export function VacationPaymentSummary({ estimate }: Props) {
    if (!estimate || estimate.grossTotal <= 0) return null;

    return (
        <div className="grid gap-2 sm:grid-cols-3">
            <div className="rounded-lg border border-base-300/60 bg-base-200/30 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-base-content/55">Férias</p>
                <p className="mt-1 text-sm font-semibold">{money(estimate.vacationPay)}</p>
            </div>
            <div className="rounded-lg border border-base-300/60 bg-base-200/30 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-base-content/55">1/3 constitucional</p>
                <p className="mt-1 text-sm font-semibold">{money(estimate.constitutionalThird)}</p>
            </div>
            <div className="rounded-lg border border-base-300/60 bg-base-200/30 p-3">
                <p className="text-xs font-medium uppercase tracking-wide text-base-content/55">Total bruto</p>
                <p className="mt-1 text-sm font-semibold">{money(estimate.grossTotal)}</p>
                {estimate.paymentDeadline ? (
                    <p className="mt-1 text-xs text-base-content/65">
                        Pagar até {estimate.paymentDeadline.split("-").reverse().join("/")} (2 dias antes do início)
                    </p>
                ) : null}
            </div>
        </div>
    );
}
