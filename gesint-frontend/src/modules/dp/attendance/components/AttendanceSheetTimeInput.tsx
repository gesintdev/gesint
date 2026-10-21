"use client";

import {Clock} from "lucide-react";
import {
    forwardRef,
    type ChangeEvent,
    type ForwardedRef,
    type KeyboardEvent,
    type MutableRefObject,
    useCallback,
    useEffect,
    useId,
    useLayoutEffect,
    useRef,
    useState,
} from "react";

import {AttendanceTimePickerModal} from "@/modules/dp/attendance/components/AttendanceTimePickerModal";
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
    /** Abre o modal de horário ao montar / quando o token muda (ícone do campo inativo). */
    openPickerToken?: number | null;
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
        {value, ariaLabel, onValueChange, onKeyDown, onPick, openPickerToken},
        ref,
    ) {
        const autoId = useId();
        const rootRef = useRef<HTMLDivElement>(null);
        const inputRef = useRef<HTMLInputElement | null>(null);
        const pendingCaretRef = useRef<number | null>(null);
        const lastOpenTokenRef = useRef<number | undefined>(undefined);
        const [open, setOpen] = useState(false);

        useLayoutEffect(() => {
            const caret = pendingCaretRef.current;
            if (caret == null) return;
            const el = inputRef.current;
            if (!el) return;
            el.setSelectionRange(caret, caret);
            pendingCaretRef.current = null;
        });

        useEffect(() => {
            if (openPickerToken == null) return;
            if (lastOpenTokenRef.current === openPickerToken) return;
            lastOpenTokenRef.current = openPickerToken;
            setOpen(true);
        }, [openPickerToken]);

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
                    aria-expanded={open}
                    tabIndex={-1}
                    onMouseDown={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                    }}
                    onClick={(event) => {
                        event.stopPropagation();
                        setOpen(true);
                    }}
                >
                    <Clock className="size-3.5"/>
                </button>
                <AttendanceTimePickerModal
                    open={open}
                    value={canonicalForPanel}
                    onApply={handlePick}
                    onClose={() => setOpen(false)}
                />
            </div>
        );
    },
);
