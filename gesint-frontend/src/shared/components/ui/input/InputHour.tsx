"use client";

import clsx from "clsx";
import { Clock } from "lucide-react";
import {
    type ChangeEvent,
    useCallback,
    useEffect,
    useId,
    useLayoutEffect,
    useRef,
    useState,
} from "react";

import { HourPickerPanel } from "@/shared/components/ui/input/HourPickerPanel";
import type { InputFieldChromeProps } from "@/shared/components/ui/input/input-field.types";
import { fieldClass, InputFieldChrome } from "@/shared/components/ui/input/InputFieldChrome";
import { useClickOutside } from "@/shared/components/ui/input/use-listbox-keyboard";
import {
    maskTimeInputWithCaret,
    parseTimeInputToValue,
    timeToDisplay,
} from "@/shared/lib/input/time";

export type InputHourProps = InputFieldChromeProps & {
    /** Valor canônico HH:mm */
    value: string;
    onValueChange: (time: string) => void;
    className?: string;
};

export function InputHour({
    value,
    onValueChange,
    label,
    hint,
    error,
    required,
    disabled,
    readOnly,
    id: idProp,
    wrapperClassName,
    sensitive,
    sensitivePermission,
    className,
}: InputHourProps) {
    const autoId = useId();
    const id = idProp ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : autoId);
    const rootRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const pendingCaretRef = useRef<number | null>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [localError, setLocalError] = useState<string | undefined>();
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState("");

    useClickOutside([rootRef, panelRef], () => setOpen(false), open);

    useEffect(() => {
        if (!isEditing) return;
        setEditText(timeToDisplay(value));
    }, [value, isEditing]);

    const display = isEditing ? editText : timeToDisplay(value);

    useLayoutEffect(() => {
        if (!isEditing) return;
        const caret = pendingCaretRef.current;
        if (caret == null) return;
        const el = inputRef.current;
        if (!el) return;
        el.setSelectionRange(caret, caret);
        pendingCaretRef.current = null;
    });

    const commitDisplay = useCallback(
        (raw: string) => {
            const parsed = parseTimeInputToValue(raw);
            if (parsed == null) {
                setLocalError("Hora inválida");
                return;
            }
            setLocalError(undefined);
            onValueChange(parsed);
        },
        [onValueChange],
    );

    const handleChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
        const {value: next, caret} = maskTimeInputWithCaret(
            event.target.value,
            event.target.selectionStart,
        );
        pendingCaretRef.current = caret;
        setEditText(next);
    }, []);

    return (
        <InputFieldChrome
            label={label}
            hint={hint}
            error={error ?? localError}
            required={required}
            disabled={disabled}
            id={id}
            wrapperClassName={wrapperClassName}
            sensitive={sensitive}
            sensitivePermission={sensitivePermission}
        >
            <div ref={rootRef} className="relative">
                <div
                    className={clsx(
                        "gesint-field",
                        fieldClass(disabled, readOnly, Boolean(error || localError)),
                        className,
                    )}
                >
                    <input
                        ref={inputRef}
                        id={id}
                        type="text"
                        inputMode="numeric"
                        placeholder="HH:mm"
                        disabled={disabled}
                        readOnly={readOnly}
                        aria-invalid={Boolean(error || localError)}
                        aria-required={required}
                        value={display}
                        maxLength={5}
                        onFocus={() => {
                            setIsEditing(true);
                            setEditText(timeToDisplay(value));
                        }}
                        onChange={handleChange}
                        onBlur={(e) => {
                            commitDisplay(e.target.value);
                            setIsEditing(false);
                        }}
                    />
                    {!readOnly && (
                        <button
                            type="button"
                            disabled={disabled}
                            className="shrink-0 text-base-content/40 transition-colors hover:text-primary disabled:pointer-events-none"
                            aria-label="Abrir seletor de hora"
                            aria-expanded={open}
                            onClick={() => setOpen((v) => !v)}
                        >
                            <Clock className="size-4" />
                        </button>
                    )}
                </div>
                {open && !readOnly && !disabled && (
                    <HourPickerPanel
                        ref={panelRef}
                        anchorRef={rootRef}
                        value={value}
                        onPick={(time) => {
                            setLocalError(undefined);
                            onValueChange(time);
                            setIsEditing(false);
                            setOpen(false);
                        }}
                    />
                )}
            </div>
        </InputFieldChrome>
    );
}
