"use client";

import type { VacationSplitPeriod } from "@/modules/person/vacation/types/vacation.types";
import { inclusiveDays, isRestrictedVacationStart, MAX_SPLIT_PERIODS } from "@/modules/person/vacation/lib/vacation-rules";
import { Button } from "@/shared/components/ui/Button";
import { InputDate } from "@/shared/components/ui/input/index";

type Props = {
    periods: VacationSplitPeriod[];
    onChange: (periods: VacationSplitPeriod[]) => void;
    fieldError?: string;
};

export function VacationSplitPeriodsEditor({ periods, onChange, fieldError }: Props) {
    const updatePeriod = (index: number, patch: Partial<VacationSplitPeriod>) => {
        const next = periods.map((p, i) => (i === index ? { ...p, ...patch } : p));
        onChange(next);
    };

    const addPeriod = () => {
        if (periods.length >= MAX_SPLIT_PERIODS) return;
        onChange([...periods, { startDate: "", endDate: "" }]);
    };

    const removePeriod = (index: number) => {
        if (periods.length <= 1) return;
        onChange(periods.filter((_, i) => i !== index));
    };

    return (
        <div className="grid gap-3 sm:col-span-2">
            {periods.map((period, index) => {
                const days =
                    period.startDate && period.endDate ? inclusiveDays(period.startDate, period.endDate) : null;
                const restricted = period.startDate ? isRestrictedVacationStart(period.startDate) : false;

                return (
                    <div
                        key={index}
                        className="grid gap-3 rounded-lg border border-base-300/50 p-3 sm:grid-cols-2"
                    >
                        <p className="text-sm font-medium text-base-content sm:col-span-2">
                            Período de gozo {index + 1}
                            {days != null ? ` · ${days} dia(s)` : ""}
                        </p>
                        <InputDate
                            label="Início"
                            value={period.startDate}
                            onValueChange={(v) => updatePeriod(index, { startDate: v })}
                            required
                        />
                        <InputDate
                            label="Fim"
                            value={period.endDate}
                            onValueChange={(v) => updatePeriod(index, { endDate: v })}
                            required
                        />
                        {restricted ? (
                            <p className="text-xs text-warning sm:col-span-2">
                                Atenção: início nos 2 dias anteriores a feriado ou domingo (DSR) — vedado pela CLT.
                            </p>
                        ) : null}
                        {periods.length > 1 ? (
                            <div className="sm:col-span-2">
                                <Button type="button" variant="ghost" size="sm" onClick={() => removePeriod(index)}>
                                    Remover período
                                </Button>
                            </div>
                        ) : null}
                    </div>
                );
            })}
            {periods.length < MAX_SPLIT_PERIODS ? (
                <Button type="button" variant="outline" size="sm" onClick={addPeriod}>
                    Adicionar período (fracionamento)
                </Button>
            ) : null}
            {fieldError ? <p className="text-sm font-medium text-error">{fieldError}</p> : null}
        </div>
    );
}
