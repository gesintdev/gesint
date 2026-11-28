"use client";

import {useEffect, useRef} from "react";

import type {AttendancePeriodWeek} from "@/modules/gp/attendance/lib/attendance-week-sections.util";
import {InputRadio} from "@/shared/components/ui/input";

type AttendanceWeekNavigatorProps = {
    weeks: AttendancePeriodWeek[];
    /** Semanas com registro na grade; as demais ficam indisponíveis. */
    availableKeys: ReadonlySet<string>;
    value: string | null;
    onSelect: (week: AttendancePeriodWeek) => void;
};

/**
 * Atalhos "Sem. 1, Sem. 2…" do Histórico de ponto: levam até a seção da semana no grid.
 * Ficam numa faixa com rolagem horizontal que ocupa o espaço livre da linha dos filtros,
 * em vez de quebrar para baixo em telas médias.
 */
export function AttendanceWeekNavigator({weeks, availableKeys, value, onSelect}: AttendanceWeekNavigatorProps) {
    const trackRef = useRef<HTMLDivElement>(null);

    const hasWeeks = weeks.length > 0;

    // Roda do mouse (vertical) rola a faixa na horizontal; as bordas esmaecem onde há atalho escondido.
    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;
        const syncEdges = () => {
            const maxScroll = track.scrollWidth - track.clientWidth;
            track.dataset.scrollStart = String(track.scrollLeft > 1);
            track.dataset.scrollEnd = String(maxScroll - track.scrollLeft > 1);
        };
        const onWheel = (event: WheelEvent) => {
            if (track.scrollWidth <= track.clientWidth) return;
            if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
            event.preventDefault();
            track.scrollLeft += event.deltaY;
        };
        syncEdges();
        const resizeObserver = new ResizeObserver(syncEdges);
        resizeObserver.observe(track);
        track.addEventListener("scroll", syncEdges, {passive: true});
        track.addEventListener("wheel", onWheel, {passive: false});
        return () => {
            resizeObserver.disconnect();
            track.removeEventListener("scroll", syncEdges);
            track.removeEventListener("wheel", onWheel);
        };
    }, [hasWeeks]);

    // A semana marcada (clique ou rolagem do grid) sempre fica visível na faixa.
    useEffect(() => {
        const track = trackRef.current;
        if (!track || !value) return;
        const checked = track.querySelector<HTMLElement>(".gesint-choice-option--active");
        checked?.scrollIntoView({block: "nearest", inline: "nearest", behavior: "smooth"});
    }, [value]);

    if (weeks.length === 0) return null;
    return (
        <div ref={trackRef} className="attendance-week-nav" role="radiogroup" aria-label="Ir para a semana">
            {weeks.map((week) => {
                const available = availableKeys.has(week.key);
                const checked = value === week.key;
                return (
                    <InputRadio
                        key={week.key}
                        name="attendance-history-week"
                        label={
                            <span title={`${week.label} · ${week.rangeLabel}`} aria-label={week.label}>
                                {week.shortLabel}
                            </span>
                        }
                        checked={checked}
                        isActive={checked}
                        isUnavailable={!available}
                        onChange={() => onSelect(week)}
                    />
                );
            })}
        </div>
    );
}
