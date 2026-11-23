"use client";

import {Clock} from "lucide-react";
import {
    type ChangeEvent,
    type ForwardedRef,
    forwardRef,
    type KeyboardEvent,
    type MutableRefObject,
    useCallback,
    useId,
    useLayoutEffect,
    useRef,
} from "react";

import {maskTimeInputWithCaret} from "@/shared/lib/input/time";

type AttendanceSheetTimeInputProps = {
    value: string;
    ariaLabel: string;
    onValueChange: (display: string) => void;
    onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
    /** Clique no ícone do relógio. O modal fica na grade, para o duplo clique da célula não abri-lo. */
    onOpenPicker?: () => void;
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
        {value, ariaLabel, onValueChange, onKeyDown, onOpenPicker},
        ref,
    ) {
        const autoId = useId();
        const inputRef = useRef<HTMLInputElement | null>(null);
        const pendingCaretRef = useRef<number | null>(null);

        useLayoutEffect(() => {
            const caret = pendingCaretRef.current;
            if (caret == null) return;
            const el = inputRef.current;
            if (!el) return;
            el.setSelectionRange(caret, caret);
            pendingCaretRef.current = null;
        });

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
                className="attendance-sheet__time-input rounded-[var(--gesint-control-radius)]"
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
                    tabIndex={-1}
                    onMouseDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                    }}
                    onClick={(event) => {
                        event.stopPropagation();
                        onOpenPicker?.();
                    }}
                >
                    <Clock className="size-3.5"/>
                </button>
            </div>
        );
    },
);
