"use client";

import clsx from "clsx";
import { CalendarDays } from "lucide-react";
import { useId, useRef } from "react";

import type { InputFieldChromeProps } from "@/shared/components/ui/input/input-field.types";
import { fieldClass, InputFieldChrome } from "@/shared/components/ui/input/InputFieldChrome";
import { MonthPickerPanel } from "@/shared/components/ui/input/MonthPickerPanel";
import { useClickOutside } from "@/shared/components/ui/input/use-listbox-keyboard";
import { useMonthField } from "@/shared/components/ui/input/useMonthField";

export type InputMonthProps = InputFieldChromeProps & {
    value: string;
    onValueChange: (isoDate: string) => void;
    min?: string;
    max?: string;
    className?: string;
};

export function InputMonth({
    value,
    onValueChange,
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
    className,
}: InputMonthProps) {
    const autoId = useId();
    const id = idProp ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : autoId);
    const rootRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const field = useMonthField({ value, onValueChange, min, max });

    useClickOutside([rootRef, panelRef], () => field.setOpen(false), field.open);

    return (
        <InputFieldChrome
            label={label}
            hint={hint}
            error={error ?? field.localError}
            required={required}
            disabled={disabled}
            id={id}
            wrapperClassName={wrapperClassName}
        >
            <div ref={rootRef} className="relative">
                <div
                    className={clsx(
                        "gommo-field",
                        fieldClass(disabled, readOnly, Boolean(error || field.localError)),
                        className,
                    )}
                >
                    <input
                        id={id}
                        type="text"
                        inputMode="numeric"
                        placeholder="MM/AAAA"
                        disabled={disabled}
                        readOnly={readOnly}
                        aria-invalid={Boolean(error || field.localError)}
                        aria-required={required}
                        value={field.display}
                        maxLength={7}
                        onFocus={field.startEditing}
                        onChange={(e) => field.onChangeEdit(e.target.value)}
                        onBlur={(e) => field.handleBlur(e.target.value)}
                    />
                    {!readOnly && (
                        <button
                            type="button"
                            disabled={disabled}
                            className="shrink-0 text-base-content/40 transition-colors hover:text-primary disabled:pointer-events-none"
                            aria-label={"Abrir seletor de compet\u00eancia"}
                            aria-expanded={field.open}
                            onClick={() => field.setOpen((v) => !v)}
                        >
                            <CalendarDays className="size-4" />
                        </button>
                    )}
                </div>
                {field.open && !readOnly && !disabled && (
                    <MonthPickerPanel
                        ref={panelRef}
                        anchorRef={rootRef}
                        value={value}
                        min={min}
                        max={max}
                        onPick={field.handlePick}
                    />
                )}
            </div>
        </InputFieldChrome>
    );
}
