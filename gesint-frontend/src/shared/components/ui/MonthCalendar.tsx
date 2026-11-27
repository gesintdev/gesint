"use client";

import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { type ReactNode, useMemo } from "react";

import { Button } from "@/shared/components/ui/Button";

export type CalendarTone = "primary" | "info" | "success" | "warning" | "error" | "neutral";

export type CalendarEvent = {
    id: string;
    label: string;
    /** yyyy-MM-dd */
    start: string;
    /** yyyy-MM-dd (inclusive) */
    end: string;
    tone: CalendarTone;
    /** Texto do tooltip (ex.: nome + tipo + período). */
    title?: string;
};

export type CalendarMarker = {
    /** yyyy-MM-dd */
    date: string;
    label: string;
};

const WEEKDAYS = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];
const monthFormatter = new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" });

/** "novembro de 2026" -> "Novembro de 2026" (só a primeira letra). */
function monthTitle(date: Date): string {
    const text = monthFormatter.format(date);
    return text.charAt(0).toUpperCase() + text.slice(1);
}
const dayFormatter = new Intl.DateTimeFormat("pt-BR", { weekday: "long", day: "2-digit", month: "long" });

function pad(value: number): string {
    return String(value).padStart(2, "0");
}

function iso(date: Date): string {
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

function parseMonth(month: string): Date {
    const [year, monthIndex] = month.split("-").map(Number);
    return new Date(year, (monthIndex || 1) - 1, 1);
}

/** Desloca um mês "yyyy-MM". */
export function shiftCalendarMonth(month: string, delta: number): string {
    const date = parseMonth(month);
    const next = new Date(date.getFullYear(), date.getMonth() + delta, 1);
    return `${next.getFullYear()}-${pad(next.getMonth() + 1)}`;
}

export function currentCalendarMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}`;
}

/** Primeiro e último dia do mês "yyyy-MM" (yyyy-MM-dd). */
export function calendarMonthBounds(month: string): { from: string; to: string } {
    const start = parseMonth(month);
    const end = new Date(start.getFullYear(), start.getMonth() + 1, 0);
    return { from: iso(start), to: iso(end) };
}

type DayCell = {
    date: string;
    day: number;
    inMonth: boolean;
    weekend: boolean;
};

function buildWeeks(month: string): DayCell[][] {
    const first = parseMonth(month);
    const gridStart = new Date(first.getFullYear(), first.getMonth(), 1 - first.getDay());
    const weeks: DayCell[][] = [];
    for (let week = 0; week < 6; week++) {
        const days: DayCell[] = [];
        for (let weekday = 0; weekday < 7; weekday++) {
            const date = new Date(gridStart.getFullYear(), gridStart.getMonth(), gridStart.getDate() + week * 7 + weekday);
            days.push({
                date: iso(date),
                day: date.getDate(),
                inMonth: date.getMonth() === first.getMonth(),
                weekend: weekday === 0 || weekday === 6,
            });
        }
        // Não desenha a 6ª semana quando ela é toda do mês seguinte.
        if (week === 5 && days.every((cell) => !cell.inMonth)) break;
        weeks.push(days);
    }
    return weeks;
}

/**
 * Calendário mensal do Gesint: grade de 7 colunas no desktop, agenda em lista no celular.
 * Eventos de vários dias aparecem em cada dia com as pontas indicando início e fim.
 */
export function MonthCalendar({
    month,
    onMonthChange,
    events,
    markers = [],
    maxPerDay = 3,
    onEventClick,
    legend,
    toolbar,
    emptyMessage = "Nenhum evento neste mês.",
}: {
    month: string;
    onMonthChange: (_month: string) => void;
    events: CalendarEvent[];
    markers?: CalendarMarker[];
    maxPerDay?: number;
    onEventClick?: (_event: CalendarEvent) => void;
    legend?: Array<{ tone: CalendarTone; label: string }>;
    toolbar?: ReactNode;
    emptyMessage?: string;
}) {
    const weeks = useMemo(() => buildWeeks(month), [month]);
    const today = iso(new Date());
    const markersByDate = useMemo(() => {
        const map = new Map<string, CalendarMarker[]>();
        for (const marker of markers) {
            map.set(marker.date, [...(map.get(marker.date) ?? []), marker]);
        }
        return map;
    }, [markers]);
    const eventsByDate = useMemo(() => {
        const map = new Map<string, CalendarEvent[]>();
        const sorted = [...events].sort((a, b) => a.start.localeCompare(b.start) || a.label.localeCompare(b.label, "pt-BR"));
        for (const week of weeks) {
            for (const cell of week) {
                const list = sorted.filter((event) => event.start <= cell.date && event.end >= cell.date);
                if (list.length) map.set(cell.date, list);
            }
        }
        return map;
    }, [events, weeks]);
    const monthDays = weeks.flat().filter((cell) => cell.inMonth);
    const agendaDays = monthDays.filter((cell) => eventsByDate.has(cell.date) || markersByDate.has(cell.date));

    const renderEvent = (event: CalendarEvent, date: string, compact: boolean) => {
        const startsHere = event.start === date;
        const endsHere = event.end === date;
        const content = (
            <>
                <span className="gesint-calendar__event-label">{event.label}</span>
            </>
        );
        const className = clsx(
            "gesint-calendar__event",
            `gesint-calendar__event--${event.tone}`,
            !compact && !startsHere && "gesint-calendar__event--continues-left",
            !compact && !endsHere && "gesint-calendar__event--continues-right",
        );
        return onEventClick ? (
            <button
                key={event.id}
                type="button"
                className={className}
                title={event.title ?? event.label}
                onClick={() => onEventClick(event)}
            >
                {content}
            </button>
        ) : (
            <span key={event.id} className={className} title={event.title ?? event.label}>
                {content}
            </span>
        );
    };

    return (
        <div className="gesint-calendar">
            <div className="gesint-calendar__toolbar">
                <div className="flex items-center gap-1">
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label="Mês anterior"
                        leftIcon={<ChevronLeft className="size-4" />}
                        onClick={() => onMonthChange(shiftCalendarMonth(month, -1))}
                    />
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        aria-label="Próximo mês"
                        leftIcon={<ChevronRight className="size-4" />}
                        onClick={() => onMonthChange(shiftCalendarMonth(month, 1))}
                    />
                    <h3 className="gesint-calendar__title">{monthTitle(parseMonth(month))}</h3>
                    {month !== currentCalendarMonth() ? (
                        <Button type="button" variant="outline" size="sm" onClick={() => onMonthChange(currentCalendarMonth())}>
                            Hoje
                        </Button>
                    ) : null}
                </div>
                {toolbar ? <div className="flex flex-wrap items-center gap-2">{toolbar}</div> : null}
            </div>

            <div className="gesint-calendar__grid" role="grid" aria-label={monthTitle(parseMonth(month))}>
                <div className="gesint-calendar__weekdays" role="row">
                    {WEEKDAYS.map((weekday) => (
                        <span key={weekday} role="columnheader" className="gesint-calendar__weekday">
                            {weekday}
                        </span>
                    ))}
                </div>
                {weeks.map((week) => (
                    <div key={week[0].date} className="gesint-calendar__week" role="row">
                        {week.map((cell) => {
                            const dayEvents = eventsByDate.get(cell.date) ?? [];
                            const dayMarkers = markersByDate.get(cell.date) ?? [];
                            const hidden = dayEvents.length - maxPerDay;
                            return (
                                <div
                                    key={cell.date}
                                    role="gridcell"
                                    className={clsx(
                                        "gesint-calendar__day",
                                        !cell.inMonth && "gesint-calendar__day--outside",
                                        cell.weekend && "gesint-calendar__day--weekend",
                                        dayMarkers.length > 0 && "gesint-calendar__day--marked",
                                    )}
                                    aria-current={cell.date === today ? "date" : undefined}
                                >
                                    <div className="gesint-calendar__day-head">
                                        <span className="gesint-calendar__day-number">{pad(cell.day)}</span>
                                        {dayMarkers.map((marker) => (
                                            <span key={marker.label} className="gesint-calendar__marker" title={marker.label}>
                                                {marker.label}
                                            </span>
                                        ))}
                                    </div>
                                    <div className="gesint-calendar__events">
                                        {dayEvents.slice(0, maxPerDay).map((event) => renderEvent(event, cell.date, false))}
                                        {hidden > 0 ? (
                                            <span
                                                className="gesint-calendar__more"
                                                title={dayEvents
                                                    .slice(maxPerDay)
                                                    .map((event) => event.title ?? event.label)
                                                    .join("\n")}
                                            >
                                                +{hidden} {hidden === 1 ? "outro" : "outros"}
                                            </span>
                                        ) : null}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>

            <div className="gesint-calendar__agenda">
                {agendaDays.length === 0 ? (
                    <p className="gesint-calendar__agenda-empty">{emptyMessage}</p>
                ) : (
                    agendaDays.map((cell) => (
                        <div
                            key={cell.date}
                            className="gesint-calendar__agenda-day"
                            aria-current={cell.date === today ? "date" : undefined}
                        >
                            <p className="gesint-calendar__agenda-date">
                                {dayFormatter.format(parseMonthDay(cell.date))}
                                {(markersByDate.get(cell.date) ?? []).map((marker) => (
                                    <span key={marker.label} className="gesint-calendar__marker">
                                        {marker.label}
                                    </span>
                                ))}
                            </p>
                            <div className="gesint-calendar__agenda-events">
                                {(eventsByDate.get(cell.date) ?? []).map((event) => renderEvent(event, cell.date, true))}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {legend?.length ? (
                <div className="gesint-calendar__legend">
                    {legend.map((item) => (
                        <span key={item.label} className="gesint-calendar__legend-item">
                            <span className={clsx("gesint-calendar__legend-dot", `gesint-calendar__event--${item.tone}`)} />
                            {item.label}
                        </span>
                    ))}
                </div>
            ) : null}
        </div>
    );
}

function parseMonthDay(date: string): Date {
    const [year, month, day] = date.split("-").map(Number);
    return new Date(year, month - 1, day);
}
