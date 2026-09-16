"use client";

import {ChevronLeft, ChevronRight} from "lucide-react";
import {shiftPeriodMonth} from "@/modules/dp/attendance/lib/attendance-period.util";
import {Button} from "@/shared/components/ui/Button";
import {InputDate} from "@/shared/components/ui/input/InputDate";

type AttendancePeriodDateFiltersProps = {
    dateFrom: string;
    dateTo: string;
    onDateFromChange: (value: string) => void;
    onDateToChange: (value: string) => void;
};

/** Filtros de período (data inicial / final) sem labels — mesmo padrão da Listagem. */
export function AttendancePeriodDateFilters({
    dateFrom,
    dateTo,
    onDateFromChange,
    onDateToChange,
}: AttendancePeriodDateFiltersProps) {
    const shiftMonth = (deltaMonths: number) => {
        const next = shiftPeriodMonth(dateFrom, deltaMonths);
        onDateFromChange(next.from);
        onDateToChange(next.to);
    };

    return (
        <div className="flex flex-wrap items-center gap-2">
            <Button
                type="button"
                variant="ghost"
                size="sm"
                leftIcon={<ChevronLeft className="size-4"/>}
                aria-label="Mês anterior"
                onClick={() => shiftMonth(-1)}
            />
            <div className="w-40">
                <InputDate
                    value={dateFrom}
                    max={dateTo || undefined}
                    onValueChange={onDateFromChange}
                    aria-label="Data inicial"
                />
            </div>
            <div className="w-40">
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
