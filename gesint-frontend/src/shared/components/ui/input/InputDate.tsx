"use client";

import clsx from "clsx";
import { Calendar } from "lucide-react";
import {
    type ChangeEvent,
    type KeyboardEvent,
    useEffect,
    useId,
    useLayoutEffect,
    useRef,
} from "react";

import { DatePickerPanel } from "@/shared/components/ui/input/DatePickerPanel";
import type { InputFieldChromeProps } from "@/shared/components/ui/input/input-field.types";
import { fieldClass, InputFieldChrome } from "@/shared/components/ui/input/InputFieldChrome";
import { useClickOutside } from "@/shared/components/ui/input/use-listbox-keyboard";
import { useDateField } from "@/shared/components/ui/input/useDateField";

export type InputDateProps = InputFieldChromeProps & {
    value: string;
    onValueChange: (isoDate: string) => void;
    /** Chamado após seleção no calendário (além de `onValueChange`). */
    onPick?: (isoDate: string) => void;
    min?: string;
    max?: string;
    className?: string;
    autoFocus?: boolean;
    /** Abre o calendário quando o token muda (ex.: ícone na célula inativa). */
    openPickerToken?: number | null;
    onKeyDown?: (event: KeyboardEvent<HTMLInputElement>) => void;
    "aria-label"?: string;
};

export function InputDate({
    value,
    onValueChange,
    onPick,
    min,
    max,
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
    autoFocus,
    openPickerToken,
    onKeyDown,
    "aria-label": ariaLabel,
}: InputDateProps) {
    const autoId = useId();
    const id = idProp ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : autoId);
    const rootRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const pendingCaretRef = useRef<number | null>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const lastOpenTokenRef = useRef<number | undefined>(undefined);
    const field = useDateField({ value, onValueChange, min, max });
    const {setOpen} = field;

    useClickOutside([rootRef, panelRef], () => setOpen(false), field.open);

    useEffect(() => {
        if (openPickerToken == null) return;
        if (lastOpenTokenRef.current === openPickerToken) return;
        lastOpenTokenRef.current = openPickerToken;
        if (readOnly || disabled) return;
        setOpen(true);
    }, [disabled, openPickerToken, readOnly, setOpen]);

    useLayoutEffect(() => {
        const caret = pendingCaretRef.current;
        if (caret == null) return;
        const el = inputRef.current;
        if (!el) return;
        el.setSelectionRange(caret, caret);
        pendingCaretRef.current = null;
    });

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        pendingCaretRef.current = field.onChangeEdit(
            event.target.value,
            event.target.selectionStart,
        );
    };

    const handlePick = (iso: string) => {
        field.handlePick(iso);
        onPick?.(iso);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" || event.key === "Tab") {
            field.handleBlur(event.currentTarget.value);
        }
        onKeyDown?.(event);
    };

    return (
        <InputFieldChrome
            label={label}
            hint={hint}
            error={error ?? field.localError}
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
                        fieldClass(disabled, readOnly, Boolean(error || field.localError)),
                        className,
                    )}
                >
                    <input
                        ref={inputRef}
                        id={id}
                        type="text"
                        inputMode="numeric"
                        placeholder="DD/MM/AAAA"
                        disabled={disabled}
                        readOnly={readOnly}
                        autoFocus={autoFocus}
                        aria-label={ariaLabel}
                        aria-invalid={Boolean(error || field.localError)}
                        aria-required={required}
                        value={field.display}
                        maxLength={10}
                        onFocus={field.startEditing}
                        onChange={handleChange}
                        onBlur={(e) => field.handleBlur(e.target.value)}
                        onKeyDown={handleKeyDown}
                    />
                    {!readOnly && (
                        <button
                            type="button"
                            disabled={disabled}
                            className="shrink-0 text-base-content/40 transition-colors hover:text-primary disabled:pointer-events-none"
                            aria-label="Abrir calendário"
                            aria-expanded={field.open}
                            onClick={() => setOpen((v) => !v)}
                        >
                            <Calendar className="size-4" />
                        </button>
                    )}
                </div>
                {field.open && !readOnly && !disabled && (
                    <DatePickerPanel
                        ref={panelRef}
                        anchorRef={rootRef}
                        value={value}
                        min={min}
                        max={max}
                        onPick={handlePick}
                    />
                )}
            </div>
        </InputFieldChrome>
    );
}
