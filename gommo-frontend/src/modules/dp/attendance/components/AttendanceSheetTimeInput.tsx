"use client";

import { Clock } from "lucide-react";
import {
    forwardRef,
    type KeyboardEvent,
    useCallback,
    useId,
    useLayoutEffect,
    useRef,
    useState,
} from "react";

import { HourPickerPanel } from "@/shared/components/ui/input/HourPickerPanel";
import { useClickOutside } from "@/shared/components/ui/input/use-listbox-keyboard";
import {
    maskTimeInput,
    parseTimeInputToValue,
    timeToDisplay,
} from "@/shared/lib/input/time";

type AttendanceSheetTimeInputProps = {
    value: string;
    ariaLabel: string;
    onValueChange: (display: string) => void;
    onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
    /** Seleção completa via painel (valor canônico HH:mm). */
    onPick?: (canonical: string) => void;
};

export const AttendanceSheetTimeInput = forwardRef<HTMLInputElement, AttendanceSheetTimeInputProps>(
    function AttendanceSheetTimeInput(
        { value, ariaLabel, onValueChange, onKeyDown, onPick },
        ref,
    ) {
        const autoId = useId();
        const rootRef = useRef<HTMLDivElement>(null);
        /** Âncora visual = célula (borda azul), não o conteúdo com padding. */
        const cellAnchorRef = useRef<HTMLElement | null>(null);
        const panelRef = useRef<HTMLDivElement>(null);
        const [open, setOpen] = useState(false);

        const syncCellAnchor = useCallback(() => {
            cellAnchorRef.current = rootRef.current?.closest("td") ?? rootRef.current;
        }, []);

        useLayoutEffect(() => {
            if (open) syncCellAnchor();
        }, [open, syncCellAnchor]);

        useClickOutside([rootRef, panelRef], () => setOpen(false), open);

        const canonicalForPanel = parseTimeInputToValue(value) || "";

        const handlePick = useCallback(
            (time: string) => {
                const display = timeToDisplay(time);
                onValueChange(display);
                setOpen(false);
                onPick?.(time);
            },
            [onPick, onValueChange],
        );

        return (
            <div
                ref={rootRef}
                className="attendance-sheet__time-input"
                data-attendance-sheet-time-input="true"
            >
                <input
                    ref={ref}
                    id={autoId}
                    type="text"
                    inputMode="numeric"
                    className="attendance-sheet__input"
                    value={value}
                    placeholder="HH:mm"
                    maxLength={5}
                    aria-label={ariaLabel}
                    onChange={(event) => onValueChange(maskTimeInput(event.target.value))}
                    onKeyDown={onKeyDown}
                />
                <button
                    type="button"
                    className="attendance-sheet__time-clock"
                    aria-label="Abrir seletor de hora"
                    aria-expanded={open}
                    tabIndex={-1}
                    onMouseDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                    }}
                    onClick={(event) => {
                        event.stopPropagation();
                        syncCellAnchor();
                        setOpen((current) => !current);
                    }}
                >
                    <Clock className="size-3.5" />
                </button>
                {open ? (
                    <HourPickerPanel
                        ref={panelRef}
                        anchorRef={cellAnchorRef}
                        align="start"
                        value={canonicalForPanel}
                        onPick={handlePick}
                    />
                ) : null}
            </div>
        );
    },
);
