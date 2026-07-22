"use client";

import {useMemo} from "react";
import {ChevronLeft, ChevronRight} from "lucide-react";

import {
    isSameDay,
    localDateKey,
    monthMatrix,
    monthTitle,
    startOfDay,
    visibleWeekHighlightDays,
    weekdayShortLabels,
} from "@/modules/cfg/settings/agenda/lib/agenda-calendar.util";

type AgendaSidebarProps = {
    visibleMonth: Date;
    selectedDate: Date;
    anchorDate: Date;
    onVisibleMonthChange: (_date: Date) => void;
    onSelectDate: (_date: Date) => void;
};

export function AgendaSidebar({
    visibleMonth,
    selectedDate,
    anchorDate,
    onVisibleMonthChange,
    onSelectDate,
}: AgendaSidebarProps) {
    const year = visibleMonth.getFullYear();
    const month = visibleMonth.getMonth();
    const weeks = monthMatrix(year, month);
    const today = startOfDay(new Date());
    const labels = weekdayShortLabels();
    const highlightedWeek = useMemo(() => visibleWeekHighlightDays(anchorDate), [anchorDate]);

    const isInVisibleWeek = (day: Date) => highlightedWeek.some((item) => isSameDay(item, day));

    return (
        <aside className="flex w-56 shrink-0 flex-col gap-4 border-r border-base-content/10 bg-base-200/40 p-3">
            <div>
                <h4 className="text-sm font-semibold">Calendário</h4>
                <div className="mt-3 rounded-xl border border-base-content/10 bg-base-100 p-2">
                    <div className="mb-2 flex items-center justify-between gap-1">
                        <button
                            type="button"
                            aria-label="Mês anterior"
                            className="gommo-btn gommo-btn--ghost gommo-btn--icon-only"
                            onClick={() => onVisibleMonthChange(new Date(year, month - 1, 1))}
                        >
                            <ChevronLeft className="size-4" />
                        </button>
                        <p className="text-xs font-semibold capitalize">{monthTitle(year, month)}</p>
                        <button
                            type="button"
                            aria-label="Próximo mês"
                            className="gommo-btn gommo-btn--ghost gommo-btn--icon-only"
                            onClick={() => onVisibleMonthChange(new Date(year, month + 1, 1))}
                        >
                            <ChevronRight className="size-4" />
                        </button>
                    </div>
                    <div className="grid grid-cols-7 gap-0.5 text-center text-[9px] text-base-content/45">
                        {labels.map((label, index) => (
                            <span key={`${label}-${index}`}>{label}</span>
                        ))}
                    </div>
                    <div className="mt-1 grid grid-cols-7 gap-0.5">
                        {weeks.flat().map((day) => {
                            const inMonth = day.getMonth() === month;
                            const selected = isSameDay(day, selectedDate);
                            const isToday = isSameDay(day, today);
                            const inWeek = isInVisibleWeek(day);
                            return (
                                <button
                                    key={localDateKey(day)}
                                    type="button"
                                    onClick={() => onSelectDate(day)}
                                    className={[
                                        "aspect-square rounded-full text-xs transition-colors",
                                        inMonth ? "text-base-content" : "text-base-content/30",
                                        selected
                                            ? "bg-primary text-primary-content"
                                            : inWeek
                                              ? "bg-primary/15 text-primary"
                                              : isToday
                                                ? "ring-1 ring-primary text-primary"
                                                : "hover:bg-base-200",
                                    ].join(" ")}
                                >
                                    {day.getDate()}
                                </button>
                            );
                        })}
                    </div>
                </div>
            </div>

            <div className="grid gap-2">
                <button
                    type="button"
                    className="gommo-btn gommo-btn--ghost justify-start gap-2 px-2 text-sm text-base-content/55"
                    disabled
                >
                    <span className="text-lg leading-none">+</span>
                    Adicionar calendário
                </button>
                <div>
                    <p className="px-1 text-xs font-semibold text-base-content/55">Meus calendários</p>
                    <label className="mt-2 flex cursor-default items-center gap-2 rounded-lg px-1 py-1.5 text-sm">
                        <input type="checkbox" className="checkbox checkbox-primary checkbox-xs" checked readOnly />
                        Calendário
                    </label>
                </div>
            </div>
            <button type="button" className="mt-auto px-1 text-left text-xs text-primary" disabled>
                Exibir tudo
            </button>
        </aside>
    );
}
