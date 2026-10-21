"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

import type { InputFieldChromeProps } from "@/shared/components/ui/input/input-field.types";
import {
    RestrictedFieldSurface,
    useIsSensitiveFieldRestricted,
} from "@/shared/components/ui/input/RestrictedFieldSurface";

export function InputFieldChrome({
    label,
    error,
    required,
    id,
    labelFor = true,
    wrapperClassName,
    sensitive,
    sensitivePermission,
    children,
}: InputFieldChromeProps & { children: ReactNode }) {
    const labelId = id ? `${id}-label` : undefined;
    const restricted = useIsSensitiveFieldRestricted(sensitive, sensitivePermission);

    return (
        <div className={wrapperClassName}>
            {label &&
                labelId &&
                (labelFor ? (
                    <label htmlFor={id} className="gesint-label">
                        {label}
                        {required && <span className="ms-0.5 text-error">*</span>}
                    </label>
                ) : (
                    <span id={labelId} className="gesint-label">
                        {label}
                        {required && <span className="ms-0.5 text-error">*</span>}
                    </span>
                ))}
            {label && !labelId && (
                <span className="gesint-label">
                    {label}
                    {required && <span className="ms-0.5 text-error">*</span>}
                </span>
            )}
            {restricted ? <RestrictedFieldSurface id={id} /> : children}
            {!restricted && error ? (
                <p className="mt-1.5 text-[11px] font-medium text-error">{error}</p>
            ) : null}
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
