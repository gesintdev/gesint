"use client";

import clsx from "clsx";
import {Clock, Zap} from "lucide-react";
import {useEffect, useMemo, useRef, useState} from "react";

import {Modal} from "@/shared/components/ui/Modal";
import {joinTime, splitTime} from "@/shared/lib/input/date";

/**
 * Seletor de horário do Histórico de ponto.
 *
 * 24h, sem AM/PM: um anel só (o anel duplo ficava ilegível). O centro alterna
 * 00–11 e 12–23; os minutos ficam no mesmo mostrador.
 */

type ClockMode = "hour" | "minute";

type AttendanceTimePickerModalProps = {
    open: boolean;
    value: string;
    onApply: (_time: string) => void;
    onClose: () => void;
};

const DIAL = 248;
const CENTER = DIAL / 2;
const RING = 98;

const QUICK_TIMES = Array.from({length: 8}, (_, index) => {
    const hour = String(index + 6).padStart(2, "0");
    return `${hour}:00`;
});

const MINUTE_MARKS = Array.from({length: 12}, (_, index) => index * 5);

function pad2(n: number) {
    return String(n).padStart(2, "0");
}

function parseInitial(value: string): {hour: number; minute: number} {
    const {hour, minute} = splitTime(value);
    const h = Number(hour);
    const m = Number(minute);
    return {
        hour: Number.isFinite(h) && h >= 0 && h <= 23 ? h : 0,
        minute: Number.isFinite(m) && m >= 0 && m <= 59 ? m : 0,
    };
}

function angleForIndex(index: number, total = 12) {
    return (index / total) * 360 - 90;
}

function polar(radius: number, index: number, total = 12) {
    const rad = (angleForIndex(index, total) * Math.PI) / 180;
    return {x: CENTER + radius * Math.cos(rad), y: CENTER + radius * Math.sin(rad)};
}

function pointerDegrees(clientX: number, clientY: number, rect: DOMRect) {
    const dx = clientX - (rect.left + rect.width / 2);
    const dy = clientY - (rect.top + rect.height / 2);
    let deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (deg < 0) deg += 360;
    return deg;
}

function minuteFromPointer(clientX: number, clientY: number, rect: DOMRect) {
    return Math.round(pointerDegrees(clientX, clientY, rect) / 6) % 60;
}

function hourFromPointer(clientX: number, clientY: number, rect: DOMRect, period: 0 | 12) {
    const index = Math.round(pointerDegrees(clientX, clientY, rect) / 30) % 12;
    return period + index;
}

function hourFaceLabel(period: 0 | 12, index: number) {
    if (period === 0) return index === 0 ? "12" : String(index);
    return String(period + index);
}

function DialTick({
    label,
    x,
    y,
    active,
    ariaLabel,
    onSelect,
}: {
    label: string;
    x: number;
    y: number;
    active: boolean;
    ariaLabel: string;
    onSelect: () => void;
}) {
    return (
        <button
            type="button"
            className={clsx("gesint-time-picker__tick", active && "gesint-time-picker__tick--active")}
            style={{left: x, top: y}}
            aria-label={ariaLabel}
            onPointerDown={(event) => {
                event.stopPropagation();
            }}
            onPointerUp={(event) => {
                event.stopPropagation();
            }}
            onClick={(event) => {
                event.stopPropagation();
                onSelect();
            }}
        >
            {label}
        </button>
    );
}

export function AttendanceTimePickerModal({
    open,
    value,
    onApply,
    onClose,
}: AttendanceTimePickerModalProps) {
    const dialRef = useRef<HTMLDivElement>(null);
    const draggingRef = useRef(false);
    const dragModeRef = useRef<ClockMode>("hour");
    const wasOpenRef = useRef(false);
    const [mode, setMode] = useState<ClockMode>("hour");
    const [hour, setHour] = useState(0);
    const [minute, setMinute] = useState(0);

    useEffect(() => {
        if (open && !wasOpenRef.current) {
            const initial = parseInitial(value);
            setHour(initial.hour);
            setMinute(initial.minute);
            setMode("hour");
        }
        wasOpenRef.current = open;
    }, [open, value]);

    const draft = useMemo(() => joinTime(pad2(hour), pad2(minute)), [hour, minute]);
    const period: 0 | 12 = hour >= 12 ? 12 : 0;
    const handAngle = mode === "hour" ? angleForIndex(hour % 12) : angleForIndex(minute, 60);
    const handRad = (handAngle * Math.PI) / 180;
    const handStart = 28;
    const handEnd = 64;

    const applyPointer = (clientX: number, clientY: number) => {
        const dial = dialRef.current;
        if (!dial) return;
        const rect = dial.getBoundingClientRect();
        if (mode === "hour") {
            const face: 0 | 12 = hour >= 12 ? 12 : 0;
            setHour(hourFromPointer(clientX, clientY, rect, face));
        } else {
            setMinute(minuteFromPointer(clientX, clientY, rect));
        }
    };

    return (
        <Modal
            open={open}
            onClose={onClose}
            title="Horário"
            icon={<Clock className="size-4" strokeWidth={2}/>}
            layoutClassName="gesint-time-picker w-full max-w-[40rem]"
            padded={false}
            scroll={false}
            actions={[
                {title: "Cancelar", variant: "outline", onClick: onClose},
                {title: "Aplicar", onClick: () => onApply(draft)},
            ]}
        >
            <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-stretch">
                <section className="flex flex-1 flex-col items-center gap-5">
                    <div className="flex items-center gap-2" role="group" aria-label="Hora e minuto">
                        <button
                            type="button"
                            className={clsx(
                                "gesint-time-picker__segment",
                                mode === "hour" && "gesint-time-picker__segment--active",
                            )}
                            aria-pressed={mode === "hour"}
                            onClick={() => setMode("hour")}
                        >
                            {pad2(hour)}
                        </button>
                        <span className="text-[1.7rem] font-semibold text-base-content/35" aria-hidden>
                            :
                        </span>
                        <button
                            type="button"
                            className={clsx(
                                "gesint-time-picker__segment",
                                mode === "minute" && "gesint-time-picker__segment--active",
                            )}
                            aria-pressed={mode === "minute"}
                            onClick={() => setMode("minute")}
                        >
                            {pad2(minute)}
                        </button>
                    </div>

                    <div
                        ref={dialRef}
                        className="gesint-time-picker__dial relative select-none touch-none"
                        onPointerDown={(event) => {
                            if ((event.target as HTMLElement).closest("button")) return;
                            draggingRef.current = true;
                            dragModeRef.current = mode;
                            event.currentTarget.setPointerCapture(event.pointerId);
                            applyPointer(event.clientX, event.clientY);
                        }}
                        onPointerMove={(event) => {
                            if (!draggingRef.current) return;
                            applyPointer(event.clientX, event.clientY);
                        }}
                        onPointerUp={() => {
                            if (!draggingRef.current) return;
                            const dragMode = dragModeRef.current;
                            draggingRef.current = false;
                            if (dragMode === "hour") setMode("minute");
                        }}
                        onPointerCancel={() => {
                            draggingRef.current = false;
                        }}
                    >
                        <div className="gesint-time-picker__face absolute inset-0 rounded-full"/>
                        <svg
                            className="pointer-events-none absolute inset-0 size-full"
                            viewBox={`0 0 ${DIAL} ${DIAL}`}
                            aria-hidden
                        >
                            <line
                                x1={CENTER + handStart * Math.cos(handRad)}
                                y1={CENTER + handStart * Math.sin(handRad)}
                                x2={CENTER + handEnd * Math.cos(handRad)}
                                y2={CENTER + handEnd * Math.sin(handRad)}
                                stroke="var(--gesint-primary)"
                                strokeWidth="2.5"
                                strokeLinecap="round"
                            />
                            <circle
                                cx={CENTER + handEnd * Math.cos(handRad)}
                                cy={CENTER + handEnd * Math.sin(handRad)}
                                r="4"
                                fill="var(--gesint-primary)"
                            />
                        </svg>

                        {mode === "hour"
                            ? Array.from({length: 12}, (_, index) => {
                                const pos = polar(RING, index);
                                const value = period + index;
                                return (
                                    <DialTick
                                        key={`h-${value}`}
                                        label={hourFaceLabel(period, index)}
                                        x={pos.x}
                                        y={pos.y}
                                        active={hour === value}
                                        ariaLabel={`Hora ${pad2(value)}`}
                                        onSelect={() => {
                                            setHour(value);
                                            setMode("minute");
                                        }}
                                    />
                                );
                            })
                            : MINUTE_MARKS.map((value) => {
                                const pos = polar(RING, value / 5);
                                return (
                                    <DialTick
                                        key={`m-${value}`}
                                        label={pad2(value)}
                                        x={pos.x}
                                        y={pos.y}
                                        active={minute === value}
                                        ariaLabel={`Minuto ${pad2(value)}`}
                                        onSelect={() => setMinute(value)}
                                    />
                                );
                            })}

                        <button
                            type="button"
                            className="gesint-time-picker__hub"
                            aria-label={
                                mode === "hour"
                                    ? period === 0
                                        ? "Mostrar horas 12 a 23"
                                        : "Mostrar horas 00 a 11"
                                    : "Voltar para as horas"
                            }
                            onClick={() => {
                                if (mode === "minute") {
                                    setMode("hour");
                                    return;
                                }
                                setHour((current) => (current + 12) % 24);
                            }}
                        >
                            {mode === "hour" ? pad2(hour) : pad2(minute)}
                        </button>
                    </div>
                </section>

                <aside className="gesint-time-picker__quick sm:w-[11.75rem]">
                    <div className="flex items-center gap-1.5 border-b border-[var(--gesint-border-subtle)] px-3 py-2.5 text-sm font-semibold text-base-content">
                        <Zap className="size-3.5 text-primary" strokeWidth={2.25}/>
                        Horários rápidos
                    </div>
                    <ul className="min-h-0 flex-1 overflow-y-auto py-1" role="listbox" aria-label="Horários rápidos">
                        {QUICK_TIMES.map((time) => {
                            const active = draft === time;
                            return (
                                <li key={time}>
                                    <button
                                        type="button"
                                        role="option"
                                        aria-selected={active}
                                        className={clsx(
                                            "gesint-time-picker__quick-item",
                                            active && "gesint-time-picker__quick-item--active",
                                        )}
                                        onClick={() => {
                                            const next = parseInitial(time);
                                            setHour(next.hour);
                                            setMinute(next.minute);
                                            setMode("minute");
                                        }}
                                    >
                                        {time}
                                    </button>
                                </li>
                            );
                        })}
                    </ul>
                </aside>
            </div>
        </Modal>
    );
}
