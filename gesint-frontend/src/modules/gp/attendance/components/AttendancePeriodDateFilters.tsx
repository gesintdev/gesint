"use client";

import {ChevronLeft, ChevronRight} from "lucide-react";

import {shiftPeriodMonth} from "@/modules/gp/attendance/lib/attendance-period.util";
import {Button} from "@/shared/components/ui/Button";
import {InputDate} from "@/shared/components/ui/input/InputDate";

type AttendancePeriodDateFiltersProps = {
    dateFrom: string;
    dateTo: string;
    onDateFromChange: (value: string) => void;
    onDateToChange: (value: string) => void;
    /** Campos de 144px (em vez de 160px) quando a linha divide espaço com outros controles. */
    compact?: boolean;
};

/** Filtros de período (data inicial / final) sem labels — mesmo padrão da Listagem. */
export function AttendancePeriodDateFilters({
    dateFrom,
    dateTo,
    onDateFromChange,
    onDateToChange,
    compact = false,
}: AttendancePeriodDateFiltersProps) {
    const fieldClassName = compact
        ? "min-w-[8.25rem] flex-1 sm:min-w-0 sm:w-36 sm:flex-none"
        : "min-w-[8.25rem] flex-1 sm:min-w-0 sm:w-40 sm:flex-none";
    const shiftMonth = (deltaMonths: number) => {
        const next = shiftPeriodMonth(dateFrom, deltaMonths);
        onDateFromChange(next.from);
        onDateToChange(next.to);
    };

    return (
        // Celular: uma linha só; os campos dividem a largura, com no mínimo 132px (a data inteira, sem corte).
        // A partir de 640px, campos de 160px (144px no compacto).
        <div className="flex w-full min-w-0 items-center gap-1.5 sm:w-auto sm:gap-2">
            <Button
                type="button"
                variant="ghost"
                size="sm"
                leftIcon={<ChevronLeft className="size-4"/>}
                aria-label="Mês anterior"
                onClick={() => shiftMonth(-1)}
            />
            <div className={fieldClassName}>
                <InputDate
                    value={dateFrom}
                    max={dateTo || undefined}
                    onValueChange={onDateFromChange}
                    aria-label="Data inicial"
                />
            </div>
            <div className={fieldClassName}>
                <InputDate
                    value={dateTo}
                    min={dateFrom || undefined}
                    onValueChange={onDateToChange}
                    aria-label="Data final"
                />
            </div>
            <Button
                type="button"
                variant="ghost"
                size="sm"
                leftIcon={<ChevronRight className="size-4"/>}
                aria-label="Próximo mês"
                onClick={() => shiftMonth(1)}
            />
        </div>
    );
}
