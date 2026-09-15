"use client";

import {Clock} from "lucide-react";
import {
    forwardRef,
    type ChangeEvent,
    type ForwardedRef,
    type KeyboardEvent,
    type MutableRefObject,
    useCallback,
    useId,
    useLayoutEffect,
    useRef,
    useState,
} from "react";

import {HourPickerPanel} from "@/shared/components/ui/input/HourPickerPanel";
import {useClickOutside} from "@/shared/components/ui/input/use-listbox-keyboard";
import {
    maskTimeInputWithCaret,
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

function assignInputRef(
    node: HTMLInputElement | null,
    local: MutableRefObject<HTMLInputElement | null>,
    forwarded: ForwardedRef<HTMLInputElement>,
) {
    local.current = node;
    if (typeof forwarded === "function") forwarded(node);
    else if (forwarded) forwarded.current = node;
}

export const AttendanceSheetTimeInput = forwardRef<HTMLInputElement, AttendanceSheetTimeInputProps>(
    function AttendanceSheetTimeInput(
        {value, ariaLabel, onValueChange, onKeyDown, onPick},
        ref,
    ) {
        const autoId = useId();
        const rootRef = useRef<HTMLDivElement>(null);
        const inputRef = useRef<HTMLInputElement | null>(null);
        const pendingCaretRef = useRef<number | null>(null);
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

        useLayoutEffect(() => {
            const caret = pendingCaretRef.current;
            if (caret == null) return;
            const el = inputRef.current;
            if (!el) return;
            el.setSelectionRange(caret, caret);
            pendingCaretRef.current = null;
        });

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

        const handleChange = useCallback(
            (event: ChangeEvent<HTMLInputElement>) => {
                const {value: next, caret} = maskTimeInputWithCaret(
                    event.target.value,
                    event.target.selectionStart,
                );
                pendingCaretRef.current = caret;
                onValueChange(next);
            },
            [onValueChange],
        );

        return (
            <div
                ref={rootRef}
                className="attendance-sheet__time-input"
                data-attendance-sheet-time-input="true"
            >
                <input
                    ref={(node) => assignInputRef(node, inputRef, ref)}
                    id={autoId}
                    type="text"
                    inputMode="numeric"
                    className="attendance-sheet__input"
                    value={value}
                    placeholder="HH:mm"
                    maxLength={5}
                    aria-label={ariaLabel}
                    onChange={handleChange}
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
                    <Clock className="size-3.5"/>
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
