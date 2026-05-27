"use client";

import clsx from "clsx";
import {useId} from "react";
import type {InputBaseProps} from "@/shared/components/ui/input/input-field.types";
import {fieldClass, InputFieldChrome} from "@/shared/components/ui/input/InputFieldChrome";

/**
 * Input primitivo: exibe, l\u00ea e altera valor de tela.
 * Inputs especializados aplicam m\u00e1scara/valida\u00e7\u00e3o e repassam valor sem m\u00e1scara via onValueChange.
 */
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
                              autoComplete,
                              inputMode,
                              type = "text",
                              min,
                              max,
                              step,
                              maxLength,
                              onBlur,
                              onFocus,
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
                    aria-invalid={ariaInvalid ?? Boolean(error)}
                    aria-required={required}
                    onChange={(e) => onDisplayChange(e.target.value)}
                    onBlur={onBlur}
                    onFocus={onFocus}
                />
                {rightSlot}
            </div>
        </InputFieldChrome>
    );
}
