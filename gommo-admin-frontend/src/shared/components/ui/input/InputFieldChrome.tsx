"use client";

import clsx from "clsx";
import type {InputFieldChromeProps} from "@/shared/components/ui/input/input-field.types";

export function InputFieldChrome({
                                     label,
                                     hint,
                                     error,
                                     required,
                                     id,
                                     wrapperClassName,
                                     children,
                                 }: InputFieldChromeProps & { children: React.ReactNode }) {
    return (
        <div className={wrapperClassName}>
            {label && (
                <label htmlFor={id} className="gommo-label">
                    {label}
                    {required && <span className="ms-0.5 text-error">*</span>}
                </label>
            )}
            {children}
            {error && <p className="mt-1.5 text-[11px] font-medium text-error">{error}</p>}
            {!error && hint && <p className="mt-1.5 text-[11px] text-base-content/45">{hint}</p>}
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
