"use client";

import {useEffect, useMemo, useRef} from "react";

import type {AgendaEvent} from "@/modules/cfg/settings/agenda/dto/agenda-event.dto";
import {
    AGENDA_HOUR_END,
    AGENDA_HOUR_START,
    AGENDA_SLOT_PX,
    dayHeaderLabel,
    eventHeightPx,
    eventTopPx,
    isSameDay,
    startOfDay,
    workWeekDays,
} from "@/modules/cfg/settings/agenda/lib/agenda-calendar.util";

type AgendaWeekGridProps = {
    anchorDate: Date;
    events: AgendaEvent[];
    onSlotClick: (_slotStart: Date) => void;
    onEventClick: (_event: AgendaEvent) => void;
};

export function AgendaWeekGrid({anchorDate, events, onSlotClick, onEventClick}: AgendaWeekGridProps) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const days = useMemo(() => workWeekDays(anchorDate), [anchorDate]);
    const hours = useMemo(
        () => Array.from({length: AGENDA_HOUR_END - AGENDA_HOUR_START}, (_, i) => AGENDA_HOUR_START + i),
        [],
    );
    const today = startOfDay(new Date());
    const now = new Date();
    const nowTop = eventTopPx(now.toISOString());

    useEffect(() => {
        const node = scrollRef.current;
        if (!node) return;
        const preferred = Math.max(0, (now.getHours() - 1) * AGENDA_SLOT_PX);
        node.scrollTop = preferred;
    }, [anchorDate]);

    return (
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
            <div className="grid shrink-0 grid-cols-[56px_repeat(5,minmax(0,1fr))] border-b border-base-content/10">
                <div />
                {days.map((day) => {
                    const active = isSameDay(day, today);
                    return (
                        <div
                            key={day.toISOString()}
                            className={[
                                "border-l border-base-content/10 px-2 py-2 text-center text-xs font-medium",
                                active ? "text-primary" : "text-base-content/70",
                            ].join(" ")}
                        >
                            {dayHeaderLabel(day)}
                        </div>
                    );
                })}
            </div>

            <div ref={scrollRef} className="min-h-0 flex-1 overflow-auto">
                <div
                    className="relative grid grid-cols-[56px_repeat(5,minmax(0,1fr))]"
                    style={{height: hours.length * AGENDA_SLOT_PX}}
                >
                    <div className="relative">
                        {hours.map((hour) => (
                            <div
                                key={hour}
                                className="absolute right-2 -translate-y-1/2 text-[11px] text-base-content/40"
                                style={{top: (hour - AGENDA_HOUR_START) * AGENDA_SLOT_PX}}
                            >
                                {String(hour).padStart(2, "0")}
                            </div>
                        ))}
                    </div>

                    {days.map((day) => {
                        const dayEvents = events.filter((event) => isSameDay(new Date(event.startsAt), day));
                        const showNow = isSameDay(day, today);
                        return (
                            <div
                                key={day.toISOString()}
                                className="relative border-l border-base-content/10"
                            >
                                {hours.map((hour) => (
                                    <button
                                        key={`${day.toISOString()}-${hour}`}
                                        type="button"
                                        className="absolute inset-x-0 border-t border-base-content/8 hover:bg-primary/5"
                                        style={{
                                            top: (hour - AGENDA_HOUR_START) * AGENDA_SLOT_PX,
                                            height: AGENDA_SLOT_PX,
                                        }}
                                        aria-label={`Novo evento ${dayHeaderLabel(day)} ${String(hour).padStart(2, "0")}:00`}
                                        onClick={() => {
                                            const slot = new Date(day);
                                            slot.setHours(hour, 0, 0, 0);
                                            onSlotClick(slot);
                                        }}
                                    >
                                        <span
                                            className="pointer-events-none absolute inset-x-0 top-1/2 border-t border-dashed border-base-content/8"
                                            aria-hidden
                                        />
                                    </button>
                                ))}

                                {dayEvents.map((event) => (
                                    <button
                                        key={event.id}
                                        type="button"
                                        className="absolute inset-x-1 z-10 overflow-hidden rounded-md border border-primary/30 bg-primary/20 px-1.5 py-1 text-left shadow-sm hover:bg-primary/30"
                                        style={{
                                            top: eventTopPx(event.startsAt),
                                            height: Math.max(22, eventHeightPx(event.startsAt, event.endsAt)),
                                        }}
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onEventClick(event);
                                        }}
                                    >
                                        <p className="truncate text-[11px] font-semibold text-primary">
                                            {event.title}
                                        </p>
                                        {event.location ? (
                                            <p className="truncate text-[10px] text-base-content/60">
                                                {event.location}
                                            </p>
                                        ) : null}
                                    </button>
                                ))}

                                {showNow ? (
                                    <div
                                        className="pointer-events-none absolute inset-x-0 z-20 flex items-center"
                                        style={{top: nowTop}}
                                    >
                                        <span className="size-2.5 -ms-1 rounded-full bg-primary" />
                                        <span className="h-0.5 flex-1 bg-primary" />
                                    </div>
                                ) : null}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
