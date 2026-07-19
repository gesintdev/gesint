"use client";

import { ChevronDown } from "lucide-react";
import type { CSSProperties, FocusEvent } from "react";

import {
    centsToNumber,
    decimalToCents,
    maskCurrencyFromCents,
    parseCurrencyToCents,
} from "@/shared/lib/input/currency";

type FieldLabelProps = {
    label: string;
    required?: boolean;
};

function FieldLabel({ label, required }: FieldLabelProps) {
    return (
        <label className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--ga-text-muted)]">
            {label}
            {required ? <span className="ml-0.5 text-[#ef4444]">*</span> : null}
        </label>
    );
}

const controlStyle: CSSProperties = {
    padding: "7px 10px",
    border: "1px solid var(--ga-border-strong)",
    borderRadius: "var(--ga-radius-sm)",
    background: "var(--ga-surface)",
    color: "var(--ga-text)",
    outline: "none",
    width: "100%",
};

function applyFocus(e: FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    e.target.style.borderColor = "var(--ga-primary)";
    e.target.style.boxShadow = "0 0 0 2px rgba(0,123,255,0.12)";
}

function applyBlur(e: FocusEvent<HTMLInputElement | HTMLSelectElement>) {
    e.target.style.borderColor = "var(--ga-border-strong)";
    e.target.style.boxShadow = "none";
}

export function AdminInput({
    label,
    value,
    onChange,
    type = "text",
    placeholder = "",
    required = false,
    disabled = false,
}: {
    label: string;
    value: string;
    onChange?: (value: string) => void;
    type?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
}) {
    return (
        <div className="flex flex-col gap-1">
            <FieldLabel label={label} required={required} />
            <input
                type={type}
                value={value}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder={placeholder}
                disabled={disabled}
                style={{
                    ...controlStyle,
                    background: disabled ? "var(--ga-surface-2)" : "var(--ga-surface)",
                }}
                onFocus={applyFocus}
                onBlur={applyBlur}
            />
        </div>
    );
}

/** Campo monetário BRL com máscara (ex.: R$ 1.234,56). Emite number decimal. */
export function AdminCurrency({
    label,
    value,
    onChange,
    required = false,
    disabled = false,
}: {
    label: string;
    value?: number;
    onChange?: (value: number | undefined) => void;
    required?: boolean;
    disabled?: boolean;
}) {
    const display = maskCurrencyFromCents(decimalToCents(value));

    return (
        <div className="flex flex-col gap-1">
            <FieldLabel label={label} required={required} />
            <input
                type="text"
                inputMode="numeric"
                value={display}
                onChange={(e) => {
                    const cents = parseCurrencyToCents(e.target.value);
                    onChange?.(centsToNumber(cents));
                }}
                placeholder="R$ 0,00"
                disabled={disabled}
                style={{
                    ...controlStyle,
                    background: disabled ? "var(--ga-surface-2)" : "var(--ga-surface)",
                }}
                onFocus={applyFocus}
                onBlur={applyBlur}
            />
        </div>
    );
}

export function AdminSelect({
    label,
    value,
    onChange,
    options,
    required = false,
}: {
    label: string;
    value: string;
    onChange?: (value: string) => void;
    options: { value: string; label: string }[];
    required?: boolean;
}) {
    return (
        <div className="flex flex-col gap-1">
            <FieldLabel label={label} required={required} />
            <div className="relative">
                <select
                    value={value}
                    onChange={(e) => onChange?.(e.target.value)}
                    style={{
                        ...controlStyle,
                        paddingRight: 28,
                        appearance: "none",
                        cursor: "pointer",
                    }}
                    onFocus={applyFocus}
                    onBlur={applyBlur}
                >
                    {options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
                <ChevronDown
                    size={13}
                    className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-[var(--ga-text-muted)]"
                />
            </div>
        </div>
    );
}
