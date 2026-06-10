import { Plus, Trash2 } from "lucide-react";
import type { VacationSplitPeriod } from "@/modules/person/vacation/types/vacation.types";
import { Button } from "@/shared/components/ui/Button";
import { InputDate, InputNumber } from "@/shared/components/ui/input/index";
import clsx from "clsx";
import {
    isRestrictedVacationStart,
    MAX_SPLIT_PERIODS,
    MIN_MAIN_SPLIT_DAYS,
    MIN_OTHER_SPLIT_DAYS,
    syncPeriodWithDays,
    validateSplitPeriods,
} from "@/modules/person/vacation/lib/vacation-rules";

const CONTROL_H = "h-[var(--gommo-control-h)] min-h-[var(--gommo-control-h)]";

function FieldLabelSpacer() {
    return (
        <span className="gommo-label mb-[0.3125rem] block select-none opacity-0" aria-hidden>
            &nbsp;
        </span>
    );
}

function formatDisplayDate(iso: string): string {
    if (!iso) return "—";
    return iso.split("-").reverse().join("/");
}

type Props = {
    periods: VacationSplitPeriod[];
    onChange: (periods: VacationSplitPeriod[]) => void;
    fieldError?: string;
};

export function VacationSplitPeriodsEditor({ periods, onChange, fieldError }: Props) {
    const updatePeriod = (index: number, patch: Partial<VacationSplitPeriod>) => {
        const current = periods[index];
        const merged = syncPeriodWithDays({ ...current, ...patch });
        onChange(periods.map((p, i) => (i === index ? merged : p)));
    };
    const addPeriod = () => {
        if (periods.length >= MAX_SPLIT_PERIODS) return;
        onChange([...periods, { startDate: "", endDate: "", days: 0 }]);
    };
    const removePeriod = (index: number) => {
        if (periods.length <= 1) return;
        onChange(periods.filter((_, i) => i !== index));
    };
    const activePeriods = periods.filter((p) => p.days > 0);
    const splitCheck = activePeriods.length > 1 ? validateSplitPeriods(periods) : null;

    return (
        <div className="grid gap-2">
            <div className="grid gap-2">
                {periods.map((period, index) => {
                    const showLabels = index === 0;
                    const isFirstRow = index === 0;
                    const isLastRow = index === periods.length - 1;
                    const canAddMore = periods.length < MAX_SPLIT_PERIODS;
                    const showAdd = isFirstRow && canAddMore;
                    const showRemove = isLastRow && periods.length > 1;
                    const restricted = period.startDate ? isRestrictedVacationStart(period.startDate) : false;
                    const periodTooShort = period.days > 0 && period.days < MIN_OTHER_SPLIT_DAYS;
                    const showSplitHints = activePeriods.length > 1;
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
                                <InputNumber
                                    label={showLabels ? "Dias" : undefined}
                                    integer
                                    align="left"
                                    value={period.days || null}
                                    onValueChange={(v) => updatePeriod(index, { days: v ?? 0 })}
                                    wrapperClassName="min-w-0 flex-1 lg:max-w-[6rem]"
                                />
                                <div className="min-w-0 flex-1">
                                    {showLabels ? (
                                        <span className="gommo-label mb-[0.3125rem] block">Fim (calculado)</span>
                                    ) : null}
                                    <div
                                        className={clsx(
                                            "gommo-field pointer-events-none bg-base-200/40 opacity-90",
                                            CONTROL_H,
                                        )}
                                        aria-label={`Fim calculado: ${formatDisplayDate(period.endDate)}`}
                                    >
                                        <span className="flex-1 truncate text-sm text-base-content/80">
                                            {formatDisplayDate(period.endDate)}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex w-full shrink-0 flex-col justify-end lg:w-10">
                                    {showLabels ? <FieldLabelSpacer /> : null}
                                    {showAdd ? (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            aria-label="Adicionar período de gozo"
                                            className={clsx("w-full lg:w-10 lg:shrink-0 lg:px-0", CONTROL_H)}
                                            leftIcon={<Plus className="size-4" />}
                                            onClick={addPeriod}
                                        />
                                    ) : showRemove ? (
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
                            {restricted ? (
                                <p className="text-xs text-warning lg:pl-[2.75rem]">
                                    Atenção: início nos 2 dias anteriores a feriado ou domingo (DSR) — vedado pela CLT.
                                </p>
                            ) : null}
                            {showSplitHints && periodTooShort ? (
                                <p className="text-xs text-warning lg:pl-[2.75rem]">
                                    No fracionamento, cada período deve ter no mínimo {MIN_OTHER_SPLIT_DAYS} dias (um
                                    deles com {MIN_MAIN_SPLIT_DAYS}+).
                                </p>
                            ) : null}
                        </div>
                    );
                })}
            </div>
            {splitCheck && !splitCheck.valid ? <p className="text-xs text-warning">{splitCheck.message}</p> : null}
            {fieldError ? <p className="text-sm font-medium text-error">{fieldError}</p> : null}
        </div>
    );
}
