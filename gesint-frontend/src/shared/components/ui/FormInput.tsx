"use client";

import clsx from "clsx";
import type { InputHTMLAttributes, ReactNode } from "react";

export type FormInputProps = InputHTMLAttributes<HTMLInputElement> & {
    label?: string;
    hint?: string;
    error?: string;
    leftIcon?: ReactNode;
    rightSlot?: ReactNode;
    wrapperClassName?: string;
};

export function FormInput({
    label,
    hint,
    error,
    leftIcon,
    rightSlot,
    className,
    wrapperClassName,
    id,
    ...props
}: FormInputProps) {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

    return (
        <div className={wrapperClassName}>
            {label && (
                <label htmlFor={inputId} className="gesint-label">
                    {label}
                </label>
            )}
            <div className={clsx("gesint-field", error && "border-error/60", className)}>
                {leftIcon}
                <input id={inputId} aria-invalid={Boolean(error)} {...props} />
                {rightSlot}
            </div>
            {error && <p className="mt-1.5 text-[11px] font-medium text-error">{error}</p>}
            {!error && hint && <p className="mt-1.5 text-[11px] text-base-content/45">{hint}</p>}
        </div>
    );
}
