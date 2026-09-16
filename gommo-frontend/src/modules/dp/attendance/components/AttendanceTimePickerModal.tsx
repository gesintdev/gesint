"use client";

import clsx from "clsx";
import {Check, Clock, X, Zap} from "lucide-react";
import {useEffect, useMemo, useRef, useState} from "react";
import {createPortal} from "react-dom";

import {Button} from "@/shared/components/ui/Button";
import {joinTime, splitTime} from "@/shared/lib/input/date";

/**
 * Seletor de horário do Histórico de ponto.
 *
 * Decisão 24h: o produto já usa HH:mm 0–23 (`HourPickerPanel`, `InputHour`,
 * placeholders). O mock tem AM/PM; aqui adaptamos para 24h (anel duplo 00–11 /
 * 12–23, depois minutos), sem toggle AM/PM.
 */

type ClockMode = "hour" | "minute";

type AttendanceTimePickerModalProps = {
    open: boolean;
    value: string;
    onApply: (time: string) => void;
    onClose: () => void;
};

const QUICK_TIMES = Array.from({length: 13}, (_, index) => {
    const hour = String(index + 6).padStart(2, "0");
    return `${hour}:00`;
});

const INNER_HOURS = Array.from({length: 12}, (_, i) => i);
const OUTER_HOURS = Array.from({length: 12}, (_, i) => i + 12);
const MINUTE_MARKS = Array.from({length: 12}, (_, i) => i * 5);

function pad2(n: number) {
    return String(n).padStart(2, "0");
}

function parseInitial(value: string): {hour: number; minute: number} {
    const {hour, minute} = splitTime(value);
    const h = Number(hour);
    const m = Number(minute);
    return {
        hour: Number.isFinite(h) && h >= 0 && h <= 23 ? h : 8,
        minute: Number.isFinite(m) && m >= 0 && m <= 59 ? m : 0,
    };
}

function angleForIndex(index: number, total = 12) {
    return (index / total) * 360 - 90;
}

function polar(cx: number, cy: number, radius: number, index: number, total = 12) {
    const rad = (angleForIndex(index, total) * Math.PI) / 180;
    return {x: cx + radius * Math.cos(rad), y: cy + radius * Math.sin(rad)};
}

function minuteFromPointer(clientX: number, clientY: number, rect: DOMRect) {
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    let deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (deg < 0) deg += 360;
    return Math.round(deg / 6) % 60;
}

function hourFromPointer(clientX: number, clientY: number, rect: DOMRect) {
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    let deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
    if (deg < 0) deg += 360;
    const index = Math.round(deg / 30) % 12;
    const outer = dist > rect.width * 0.28;
    return outer ? index + 12 : index;
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
            className={clsx("gommo-time-picker__tick", active && "gommo-time-picker__tick--active")}
            style={{left: x, top: y}}
            aria-label={ariaLabel}
            onPointerDown={(event) => {
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
    const dialogRef = useRef<HTMLDialogElement>(null);
    const dialRef = useRef<HTMLDivElement>(null);
    const draggingRef = useRef(false);
    const [mounted, setMounted] = useState(false);
    const [mode, setMode] = useState<ClockMode>("hour");
    const [hour, setHour] = useState(8);
    const [minute, setMinute] = useState(0);

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog) return;
        if (open && !dialog.open) {
            const initial = parseInitial(value);
            setHour(initial.hour);
            setMinute(initial.minute);
            setMode("hour");
            dialog.showModal();
        }
        if (!open && dialog.open) {
            dialog.close();
        }
    }, [open, value, mounted]);

    const draft = useMemo(() => joinTime(pad2(hour), pad2(minute)), [hour, minute]);
    const handRadius = mode === "hour" ? (hour >= 12 ? 88 : 58) : 88;
    const handAngle = mode === "hour" ? angleForIndex(hour % 12) : angleForIndex(minute, 60);

    const applyPointer = (clientX: number, clientY: number) => {
        const dial = dialRef.current;
        if (!dial) return;
        const rect = dial.getBoundingClientRect();
        if (mode === "hour") {
            setHour(hourFromPointer(clientX, clientY, rect));
        } else {
            setMinute(minuteFromPointer(clientX, clientY, rect));
        }
    };

    // Portal fora da tabela: `.gommo-table .gommo-btn` encolhe botões para --gommo-table-action-size.
    if (!mounted) return null;

    return createPortal(
        <dialog
            ref={dialogRef}
            className="modal gommo-time-picker-modal"
            onClose={onClose}
            onCancel={(event) => {
                event.preventDefault();
                onClose();
            }}
            onClick={(event) => {
                event.stopPropagation();
            }}
        >
            <div className="modal-box gommo-time-picker flex w-full max-w-[34rem] flex-col gap-0 p-0">
                <header className="flex items-center justify-between gap-3 border-b border-[var(--gommo-border-subtle)] px-4 py-3">
                    <div className="flex items-center gap-2.5">
                        <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                            <Clock className="size-4" strokeWidth={2}/>
                        </span>
                        <h3 className="text-base font-semibold text-base-content">Horário</h3>
                    </div>
                    <button
                        type="button"
                        className="inline-flex size-8 items-center justify-center rounded-full text-base-content/50 transition-colors hover:bg-base-200 hover:text-base-content"
                        aria-label="Fechar"
                        onClick={onClose}
                    >
                        <X className="size-4"/>
                    </button>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_11.5rem]">
                    <section className="flex flex-col items-center gap-4 px-5 py-5">
                        <div className="flex items-center gap-1.5" role="group" aria-label="Hora e minuto">
                            <button
                                type="button"
                                className={clsx(
                                    "gommo-time-picker__segment",
                                    mode === "hour" && "gommo-time-picker__segment--active",
                                )}
                                aria-pressed={mode === "hour"}
                                onClick={() => setMode("hour")}
                            >
                                {pad2(hour)}
                            </button>
                            <span className="text-2xl font-semibold text-base-content/40" aria-hidden>
                                :
                            </span>
                            <button
                                type="button"
                                className={clsx(
                                    "gommo-time-picker__segment",
                                    mode === "minute" && "gommo-time-picker__segment--active",
                                )}
                                aria-pressed={mode === "minute"}
                                onClick={() => setMode("minute")}
                            >
                                {pad2(minute)}
                            </button>
                        </div>

                        <div
                            ref={dialRef}
                            className="gommo-time-picker__dial relative select-none touch-none"
                            onPointerDown={(event) => {
                                event.currentTarget.setPointerCapture(event.pointerId);
                                draggingRef.current = true;
                                applyPointer(event.clientX, event.clientY);
                            }}
                            onPointerMove={(event) => {
                                if (!draggingRef.current) return;
                                applyPointer(event.clientX, event.clientY);
                            }}
                            onPointerUp={(event) => {
                                draggingRef.current = false;
                                applyPointer(event.clientX, event.clientY);
                                if (mode === "hour") setMode("minute");
                            }}
                        >
                            <div className="gommo-time-picker__face absolute inset-0 rounded-full"/>
                            <svg
                                className="pointer-events-none absolute inset-0 size-full"
                                viewBox="0 0 224 224"
                                aria-hidden
                            >
                                <line
                                    x1="112"
                                    y1="112"
                                    x2={112 + handRadius * Math.cos((handAngle * Math.PI) / 180)}
                                    y2={112 + handRadius * Math.sin((handAngle * Math.PI) / 180)}
                                    stroke="var(--gommo-primary)"
                                    strokeWidth="2.5"
                                    strokeLinecap="round"
                                />
                                <circle cx="112" cy="112" r="4.5" fill="var(--gommo-primary)"/>
                            </svg>

                            {mode === "hour"
                                ? (
                                    <>
                                        {INNER_HOURS.map((value) => {
                                            const pos = polar(112, 112, 58, value);
                                            return (
                                                <DialTick
                                                    key={`h-in-${value}`}
                                                    label={pad2(value)}
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
                                        })}
                                        {OUTER_HOURS.map((value) => {
                                            const pos = polar(112, 112, 88, value % 12);
                                            return (
                                                <DialTick
                                                    key={`h-out-${value}`}
                                                    label={pad2(value)}
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
                                        })}
                                    </>
                                )
                                : (
                                    <>
                                        {MINUTE_MARKS.map((value) => {
                                            const pos = polar(112, 112, 88, value / 5);
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
                                        {minute % 5 !== 0 ? (
                                            <span
                                                className="gommo-time-picker__tick gommo-time-picker__tick--active pointer-events-none"
                                                style={{
                                                    left:
                                                        112 +
                                                        88 * Math.cos((handAngle * Math.PI) / 180),
                                                    top:
                                                        112 +
                                                        88 * Math.sin((handAngle * Math.PI) / 180),
                                                }}
                                                aria-hidden
                                            >
                                                {pad2(minute)}
                                            </span>
                                        ) : null}
                                    </>
                                )}
                        </div>
                    </section>

                    <aside className="flex min-h-0 flex-col border-t border-[var(--gommo-border-subtle)] sm:border-l sm:border-t-0">
                        <div className="flex items-center gap-1.5 border-b border-[var(--gommo-border-subtle)] px-3 py-2.5 text-sm font-semibold text-base-content">
                            <Zap className="size-3.5 text-primary" strokeWidth={2}/>
                            Horários rápidos
                        </div>
                        <ul className="max-h-72 overflow-y-auto py-1.5" role="listbox" aria-label="Horários rápidos">
                            {QUICK_TIMES.map((time) => {
                                const active = draft === time;
                                return (
                                    <li key={time}>
                                        <button
                                            type="button"
                                            role="option"
                                            aria-selected={active}
                                            className={clsx(
                                                "flex w-full items-center justify-between px-3 py-2 text-sm transition-colors",
                                                active
                                                    ? "bg-primary/10 font-semibold text-primary"
                                                    : "text-base-content hover:bg-base-200/70",
                                            )}
                                            onClick={() => {
                                                const next = parseInitial(time);
                                                setHour(next.hour);
                                                setMinute(next.minute);
                                                setMode("minute");
                                            }}
                                        >
                                            <span>{time}</span>
                                            {active ? <Check className="size-4" strokeWidth={2.25}/> : null}
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </aside>
                </div>

                <footer className="modal-action mt-0 border-t border-[var(--gommo-border-subtle)] px-4 py-3">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        onClick={() => {
                            onApply(draft);
                        }}
                    >
                        Aplicar
                    </Button>
                </footer>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button type="submit" aria-label="Fechar">
                    fechar
                </button>
            </form>
        </dialog>,
        document.body,
    );
}
