"use client";

import clsx from "clsx";
import { Calendar } from "lucide-react";
import { useId, useRef, useState } from "react";

import { DatetimePickerPanel } from "@/shared/components/ui/input/DatetimePickerPanel";
import type { InputFieldChromeProps } from "@/shared/components/ui/input/input-field.types";
import { fieldClass, InputFieldChrome } from "@/shared/components/ui/input/InputFieldChrome";
import { useClickOutside } from "@/shared/components/ui/input/use-listbox-keyboard";
import { formatDatetimeBr } from "@/shared/lib/input/date";

export type InputDatetimeProps = InputFieldChromeProps & {
    value: string;
    onValueChange: (isoLocal: string) => void;
    min?: string;
    max?: string;
    className?: string;
};

export function InputDatetime({
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
}: InputDatetimeProps) {
    const autoId = useId();
    const id = idProp ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : autoId);
    const rootRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);

    useClickOutside([rootRef, panelRef], () => setOpen(false), open);

    const display = formatDatetimeBr(value);

    return (
        <InputFieldChrome
            label={label}
            hint={hint ?? "Um único menu: calendário + hora e minuto. Enviado como YYYY-MM-DDTHH:mm"}
            error={error}
            required={required}
            disabled={disabled}
            id={id}
            wrapperClassName={clsx(wrapperClassName, "min-w-0")}
        >
            <div ref={rootRef} className="relative w-full min-w-0">
                <button
                    type="button"
                    id={id}
                    disabled={disabled || readOnly}
                    aria-haspopup="dialog"
                    aria-expanded={open}
                    className={clsx(
                        "gommo-field w-full cursor-pointer text-left",
                        fieldClass(disabled, readOnly, Boolean(error)),
                        !display && "gommo-select-trigger--placeholder",
                        className,
                    )}
                    onClick={() => !disabled && !readOnly && setOpen((v) => !v)}
                >
                    <span className="min-w-0 flex-1 truncate">{display || "DD/MM/AAAA HH:mm"}</span>
                    <Calendar className="size-4 shrink-0 text-base-content/40" aria-hidden />
                </button>
                {open && !readOnly && !disabled && (
                    <DatetimePickerPanel
                        ref={panelRef}
                        anchorRef={rootRef}
                        value={value}
                        min={min}
                        max={max}
                        onChange={(next) => {
                            onValueChange(next);
                        }}
                    />
                )}
            </div>
        </InputFieldChrome>
    );
}
