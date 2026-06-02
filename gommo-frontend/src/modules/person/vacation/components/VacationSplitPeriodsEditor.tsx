"use client";

import clsx from "clsx";
import { Plus, Trash2 } from "lucide-react";
import type { VacationSplitPeriod } from "@/modules/person/vacation/types/vacation.types";
import {
    inclusiveDays,
    isRestrictedVacationStart,
    MAX_SPLIT_PERIODS,
} from "@/modules/person/vacation/lib/vacation-rules";
import { Button } from "@/shared/components/ui/Button";
import { InputDate } from "@/shared/components/ui/input/index";

const CONTROL_H = "h-[var(--gommo-control-h)] min-h-[var(--gommo-control-h)]";

/** Mesma altura da `.gommo-label` + margin-bottom, para alinhar índice/botão ao campo (não ao label). */
function FieldLabelSpacer() {
    return (
        <span className="gommo-label mb-[0.3125rem] block select-none opacity-0" aria-hidden>
            &nbsp;
        </span>
    );
}

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
        <div className="grid gap-2">
            <p className="text-[10pt] font-medium text-base-content">Período de gozo</p>
            <div className="grid gap-2">
                {periods.map((period, index) => {
                    const showLabels = index === 0;
                    const isLastRow = index === periods.length - 1;
                    const canAddMore = periods.length < MAX_SPLIT_PERIODS;
                    const days =
                        period.startDate && period.endDate ? inclusiveDays(period.startDate, period.endDate) : null;
                    const restricted = period.startDate ? isRestrictedVacationStart(period.startDate) : false;

                    return (
                        <div key={index} className="grid gap-1">
                            <div className="flex flex-col gap-2 lg:flex-row lg:items-end">
                                <div className="flex w-full shrink-0 flex-col justify-end lg:w-10">
                                    {showLabels ? <FieldLabelSpacer /> : null}
                                    <span
                                        className={clsx(
                                            "flex items-center justify-center rounded-md border border-base-300/50 bg-base-200/40 text-xs font-semibold text-base-content/60",
                                            CONTROL_H,
                                        )}
                                        aria-hidden
                                    >
                                        {index + 1}
                                    </span>
                                </div>
                                <InputDate
                                    label={showLabels ? "Início" : undefined}
                                    value={period.startDate}
                                    onValueChange={(v) => updatePeriod(index, { startDate: v })}
                                    required
                                    wrapperClassName="min-w-0 flex-1"
                                />
                                <InputDate
                                    label={showLabels ? "Fim" : undefined}
                                    value={period.endDate}
                                    onValueChange={(v) => updatePeriod(index, { endDate: v })}
                                    required
                                    wrapperClassName="min-w-0 flex-1"
                                />
                                <div className="flex w-full shrink-0 flex-col justify-end lg:w-10">
                                    {showLabels ? <FieldLabelSpacer /> : null}
                                    {isLastRow && canAddMore ? (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            aria-label="Adicionar período de gozo"
                                            className={clsx("w-full lg:w-10 lg:shrink-0 lg:px-0", CONTROL_H)}
                                            leftIcon={<Plus className="size-4" />}
                                            onClick={addPeriod}
                                        />
                                    ) : periods.length > 1 ? (
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            aria-label={`Remover período ${index + 1}`}
                                            className={clsx("w-full lg:w-10 lg:shrink-0 lg:px-0", CONTROL_H)}
                                            leftIcon={<Trash2 className="size-4" />}
                                            onClick={() => removePeriod(index)}
                                        />
                                    ) : (
                                        <div className={clsx("hidden lg:block lg:w-10", CONTROL_H)} />
                                    )}
                                </div>
                            </div>
                            {days != null ? (
                                <p className="text-xs text-base-content/50 lg:pl-[2.75rem]">{days} dia(s)</p>
                            ) : null}
                            {restricted ? (
                                <p className="text-xs text-warning lg:pl-[2.75rem]">
                                    Atenção: início nos 2 dias anteriores a feriado ou domingo (DSR) — vedado pela CLT.
                                </p>
                            ) : null}
                        </div>
                    );
                })}
            </div>
            {fieldError ? <p className="text-sm font-medium text-error">{fieldError}</p> : null}
        </div>
    );
}
