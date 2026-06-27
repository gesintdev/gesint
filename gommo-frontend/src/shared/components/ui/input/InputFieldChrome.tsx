"use client";

import clsx from "clsx";

import type { InputFieldChromeProps } from "@/shared/components/ui/input/input-field.types";

export function InputFieldChrome({
    label,
    error,
    required,
    id,
    labelFor = true,
    wrapperClassName,
    children,
}: InputFieldChromeProps & { children: React.ReactNode }) {
    const labelId = id ? `${id}-label` : undefined;

    return (
        <div className={wrapperClassName}>
            {label &&
                labelId &&
                (labelFor ? (
                    <label htmlFor={id} className="gommo-label">
                        {label}
                        {required && <span className="ms-0.5 text-error">*</span>}
                    </label>
                ) : (
                    <span id={labelId} className="gommo-label">
                        {label}
                        {required && <span className="ms-0.5 text-error">*</span>}
                    </span>
                ))}
            {label && !labelId && (
                <span className="gommo-label">
                    {label}
                    {required && <span className="ms-0.5 text-error">*</span>}
                </span>
            )}
            {children}
            {error && <p className="mt-1.5 text-[11px] font-medium text-error">{error}</p>}
        </div>
    );
}

export function fieldClass(disabled?: boolean, readOnly?: boolean, hasError?: boolean) {
    return clsx(
        disabled && "pointer-events-none opacity-60",
        readOnly && "bg-base-200/50",
        hasError && "border-error/60 focus-within:ring-error/25",
    );
}
