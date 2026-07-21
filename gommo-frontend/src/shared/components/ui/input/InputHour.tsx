"use client";

import clsx from "clsx";
import { Clock } from "lucide-react";
import { useCallback, useId, useRef, useState } from "react";

import { HourPickerPanel } from "@/shared/components/ui/input/HourPickerPanel";
import type { InputFieldChromeProps } from "@/shared/components/ui/input/input-field.types";
import { fieldClass, InputFieldChrome } from "@/shared/components/ui/input/InputFieldChrome";
import { useClickOutside } from "@/shared/components/ui/input/use-listbox-keyboard";
import { maskTimeInput, parseTimeInputToValue, timeToDisplay } from "@/shared/lib/input/time";

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
    className,
}: InputHourProps) {
    const autoId = useId();
    const id = idProp ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : autoId);
    const rootRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);
    const [localError, setLocalError] = useState<string | undefined>();
    const [isEditing, setIsEditing] = useState(false);
    const [editText, setEditText] = useState("");

    useClickOutside([rootRef, panelRef], () => setOpen(false), open);

    const display = isEditing ? editText : timeToDisplay(value);

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

    return (
        <InputFieldChrome
            label={label}
            hint={hint}
            error={error ?? localError}
            required={required}
            disabled={disabled}
            id={id}
            wrapperClassName={wrapperClassName}
        >
            <div ref={rootRef} className="relative">
                <div
                    className={clsx(
                        "gommo-field",
                        fieldClass(disabled, readOnly, Boolean(error || localError)),
                        className,
                    )}
                >
                    <input
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
                        onChange={(e) => setEditText(maskTimeInput(e.target.value))}
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
