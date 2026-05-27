"use client";

import clsx from "clsx";
import { DayPicker } from "react-day-picker";
import { ptBR } from "react-day-picker/locale";
import { forwardRef, useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { dateToIso, joinDatetime, joinTime, parseIsoToDate, splitDatetime, splitTime } from "@/shared/lib/input/date";
import { DATETIME_HOUR_ITEMS, DATETIME_MINUTE_ITEMS } from "@/shared/lib/input/datetime-options";

type DatetimePickerPanelProps = {
  value: string;
  min?: string;
  max?: string;
  onChange: (isoLocal: string) => void;
  anchorRef: React.RefObject<HTMLElement | null>;
};

export const DatetimePickerPanel = forwardRef<HTMLDivElement, DatetimePickerPanelProps>(
  function DatetimePickerPanel({ value, min, max, onChange, anchorRef }, ref) {
    const [position, setPosition] = useState({ top: 0, left: 0, width: 320 });
    const { date, time } = splitDatetime(value);
    const parsed = splitTime(time);

    const [draftDate, setDraftDate] = useState(date);
    const [draftHour, setDraftHour] = useState(parsed.hour || "00");
    const [draftMinute, setDraftMinute] = useState(parsed.minute || "01");

    useEffect(() => {
      const { date: d, time: t } = splitDatetime(value);
      const { hour, minute } = splitTime(t);
      setDraftDate(d);
      setDraftHour(hour || "00");
      setDraftMinute(minute || "01");
    }, [value]);

    const emit = (nextDate: string, nextHour: string, nextMinute: string) => {
      if (!nextDate) {
        onChange("");
        return;
      }
      const nextTime = joinTime(nextHour, nextMinute);
      onChange(joinDatetime(nextDate, nextTime));
    };

    const updatePosition = () => {
      const anchor = anchorRef.current;
      if (!anchor) return;
      const rect = anchor.getBoundingClientRect();
      setPosition({
        top: rect.bottom + 6,
        left: rect.left,
        width: Math.max(rect.width, 320),
      });
    };

    useLayoutEffect(() => {
      updatePosition();
    }, [anchorRef]);

    useEffect(() => {
      updatePosition();
      window.addEventListener("resize", updatePosition);
      window.addEventListener("scroll", updatePosition, true);
      return () => {
        window.removeEventListener("resize", updatePosition);
        window.removeEventListener("scroll", updatePosition, true);
      };
    }, [anchorRef]);

    if (typeof document === "undefined") return null;

    const selected = parseIsoToDate(draftDate);
    const fromDate = parseIsoToDate(min ?? "");
    const toDate = parseIsoToDate(max ?? "");

    return createPortal(
      <div
        ref={ref}
        className="gommo-datetime-picker-panel surface-popover fixed z-[200] overflow-hidden"
        style={{
          top: position.top,
          left: position.left,
          width: position.width,
        }}
        role="dialog"
        aria-label="Data e hora"
      >
        <DayPicker
          mode="single"
          locale={ptBR}
          className="react-day-picker p-2"
          selected={selected}
          onSelect={(d) => {
            if (!d) return;
            const iso = dateToIso(d);
            setDraftDate(iso);
            emit(iso, draftHour, draftMinute);
          }}
          disabled={[
            fromDate ? { before: fromDate } : undefined,
            toDate ? { after: toDate } : undefined,
          ].filter((m): m is { before: Date } | { after: Date } => Boolean(m))}
          defaultMonth={selected ?? new Date()}
        />

        <div className="grid grid-cols-2 gap-px border-t border-[var(--gommo-border-subtle)] bg-[var(--gommo-border-subtle)]">
          <TimeColumn
            label="Hora"
            items={DATETIME_HOUR_ITEMS}
            value={draftHour}
            onPick={(h) => {
              setDraftHour(h);
              emit(draftDate, h, draftMinute);
            }}
          />
          <TimeColumn
            label="Minuto"
            items={DATETIME_MINUTE_ITEMS}
            value={draftMinute}
            onPick={(m) => {
              setDraftMinute(m);
              emit(draftDate, draftHour, m);
            }}
          />
        </div>
      </div>,
      document.body,
    );
  },
);

function TimeColumn({
  label,
  items,
  value,
  onPick,
}: {
  label: string;
  items: { value: string; label: string }[];
  value: string;
  onPick: (v: string) => void;
}) {
  return (
    <div className="flex max-h-36 flex-col bg-[var(--color-base-100)]">
      <p className="shrink-0 border-b border-[var(--gommo-border-subtle)] px-2 py-1.5 text-center text-[10px] font-semibold uppercase tracking-wide text-base-content/50">
        {label}
      </p>
      <ul className="overflow-y-auto py-1" role="listbox" aria-label={label}>
        {items.map((item) => {
          const active = item.value === value;
          return (
            <li key={item.value}>
              <button
                type="button"
                role="option"
                aria-selected={active}
                className={clsx(
                  "w-full px-3 py-1.5 text-center text-sm transition-colors",
                  active
                    ? "bg-primary font-semibold text-primary-content"
                    : "hover:bg-base-200",
                )}
                onClick={() => onPick(item.value)}
              >
                {item.label}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
