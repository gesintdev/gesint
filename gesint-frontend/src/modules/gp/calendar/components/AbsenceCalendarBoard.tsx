"use client";

import { useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import type { AbsenceCalendarEvent } from "@/modules/gp/shared/dto/time-management.dto";
import { ABSENCE_CATEGORY_LABELS } from "@/modules/gp/shared/lib/time-labels";
import { timeManagementService } from "@/modules/gp/shared/services/time-management.service";
import { timeManagementKeys } from "@/modules/gp/shared/time-management.query";
import { InputSelect } from "@/shared/components/ui/input";
import {
    calendarMonthBounds,
    type CalendarTone,
    currentCalendarMonth,
    MonthCalendar,
} from "@/shared/components/ui/MonthCalendar";
import { ExceptionCapture } from "@/shared/exceptions";
import { useBranchScopedQueryKey } from "@/shared/hooks/useBranchScopedQueryKey";
import { formatBadgeCellValue } from "@/shared/lib/table/format-cell-value";

type CategoryFilter = "" | AbsenceCalendarEvent["category"];

const CATEGORY_TONE: Record<AbsenceCalendarEvent["category"], CalendarTone> = {
    VACATION: "info",
    LEAVE: "warning",
    ABSENCE: "error",
};

const CATEGORY_ITEMS = [
    { value: "VACATION", label: "Férias" },
    { value: "LEAVE", label: "Afastamentos" },
    { value: "ABSENCE", label: "Faltas" },
];

const dateFormatter = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "2-digit" });

function shortDate(value: string): string {
    const [year, month, day] = value.split("-").map(Number);
    return dateFormatter.format(new Date(year, month - 1, day));
}

/**
 * Agenda mensal de férias, afastamentos e faltas. Lê o que o RH/DP cadastrou; a Gestão de Ponto
 * não edita ausências.
 */
export function AbsenceCalendarBoard({ maxPerDay = 3 }: { maxPerDay?: number }) {
    const [month, setMonth] = useState(currentCalendarMonth);
    const [category, setCategory] = useState<CategoryFilter>("");
    const bounds = calendarMonthBounds(month);
    const queryKey = useBranchScopedQueryKey(timeManagementKeys.calendar(bounds.from, bounds.to));
    const query = useQuery({
        queryKey,
        queryFn: () => timeManagementService.calendar(bounds.from, bounds.to),
    });

    const events = useMemo(
        () =>
            (query.data?.events ?? [])
                .filter((event) => !category || event.category === category)
                .map((event) => {
                    const name = event.collaboratorName ?? "Colaborador";
                    const type = event.type ? formatBadgeCellValue(event.type) : ABSENCE_CATEGORY_LABELS[event.category];
                    return {
                        id: event.id,
                        label: name,
                        start: event.startDate,
                        end: event.endDate,
                        tone: CATEGORY_TONE[event.category],
                        title: `${name} · ${type} · ${shortDate(event.startDate)} a ${shortDate(event.endDate)}`,
                    };
                }),
        [query.data, category],
    );

    const markers = useMemo(
        () => (query.data?.holidays ?? []).map((date) => ({ date, label: "Feriado" })),
        [query.data],
    );

    if (query.isError) {
        return (
            <p className="text-sm text-error">
                {ExceptionCapture.displayMessage(query.error, "Não foi possível carregar a agenda de ausências.")}
            </p>
        );
    }

    return (
        <MonthCalendar
            month={month}
            onMonthChange={setMonth}
            events={events}
            markers={markers}
            maxPerDay={maxPerDay}
            emptyMessage={
                query.isLoading ? "Carregando a agenda do mês." : "Ninguém de férias ou afastado neste mês."
            }
            legend={[
                { tone: "info", label: "Férias" },
                { tone: "warning", label: "Afastamento" },
                { tone: "error", label: "Falta" },
            ]}
            toolbar={
                <div className="w-44">
                    <InputSelect
                        items={CATEGORY_ITEMS}
                        value={category}
                        placeholder="Todas as ausências"
                        clearable
                        onValueChange={(value) => setCategory((value || "") as CategoryFilter)}
                    />
                </div>
            }
        />
    );
}
