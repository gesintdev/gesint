"use client";
import clsx from "clsx";
import { Loader2 } from "lucide-react";
import { useId } from "react";

import type { InputBaseProps } from "@/shared/components/ui/input/input-field.types";
import { fieldClass, InputFieldChrome } from "@/shared/components/ui/input/InputFieldChrome";

export function InputBase({
    label,
    hint,
    error,
    required,
    disabled,
    readOnly,
    wrapperClassName,
    id: idProp,
    displayValue,
    onDisplayChange,
    placeholder,
    leftIcon,
    rightSlot,
    className,
    inputClassName,
    autoComplete,
    inputMode,
    type = "text",
    min,
    max,
    step,
    maxLength,
    loading,
    onBlur,
    onFocus,
    onKeyDown,
    "aria-invalid": ariaInvalid,
}: InputBaseProps) {
    const autoId = useId();
    const id = idProp ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : autoId);

    return (
        <InputFieldChrome
            label={label}
            hint={hint}
            error={error}
            required={required}
            disabled={disabled}
            id={id}
            wrapperClassName={wrapperClassName}
        >
            <div
                className={clsx(
                    "gommo-field",
                    fieldClass(disabled, readOnly, Boolean(error || ariaInvalid)),
                    className,
                )}
            >
                {leftIcon}
                <input
                    id={id}
                    type={type}
                    value={displayValue}
                    readOnly={readOnly}
                    disabled={disabled}
                    placeholder={placeholder}
                    autoComplete={autoComplete}
                    inputMode={inputMode}
                    maxLength={maxLength}
                    min={min}
                    max={max}
                    step={step}
                    className={inputClassName}
                    aria-invalid={ariaInvalid ?? Boolean(error)}
                    aria-required={required}
                    onChange={(e) => onDisplayChange(e.target.value)}
                    onBlur={onBlur}
                    onFocus={onFocus}
                    onKeyDown={onKeyDown}
                />
                {loading && <Loader2 className="size-4 shrink-0 animate-spin text-base-content/35" />}
                {rightSlot}
            </div>
        </InputFieldChrome>
    );
}
