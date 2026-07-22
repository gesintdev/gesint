"use client";

import clsx from "clsx";
import { useId } from "react";

import {
    fieldClass,
    InputFieldChrome,
} from "@/shared/components/ui/input/InputFieldChrome";
import type { InputFieldChromeProps } from "@/shared/components/ui/input/input-field.types";

/** Cor secundária do layout (`--color-secondary` / `--gommo-primary-dark`). */
export const GOMMO_SECONDARY_COLOR = "#0062cc";

export type InputColorProps = InputFieldChromeProps & {
    value: string;
    onValueChange: (value: string) => void;
    /** Hex usado quando o valor está vazio (exibe no preview). */
    fallbackColor?: string;
    allowClear?: boolean;
    className?: string;
};

function normalizeHex(value: string): string {
    const trimmed = value.trim();
    if (!trimmed) return "";
    const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
    if (!/^#[0-9A-Fa-f]{6}$/.test(withHash)) return trimmed;
    return withHash.toUpperCase();
}

export function InputColor({
    value,
    onValueChange,
    fallbackColor = GOMMO_SECONDARY_COLOR,
    allowClear = true,
    className,
    disabled,
    readOnly,
    error,
    id: idProp,
    ...chrome
}: InputColorProps) {
    const autoId = useId();
    const id = idProp ?? autoId;
    const normalized = normalizeHex(value);
    const preview = normalized || fallbackColor;
    const pickerValue = /^#[0-9A-Fa-f]{6}$/i.test(preview) ? preview : fallbackColor;

    return (
        <InputFieldChrome {...chrome} id={id} error={error} disabled={disabled} readOnly={readOnly}>
            <div className={clsx("gommo-field flex items-center gap-2", fieldClass(disabled, readOnly, Boolean(error)), className)}>
                <input
                    type="color"
                    aria-label={chrome.label ? `${chrome.label} (seletor)` : "Seletor de cor"}
                    className="size-8 shrink-0 cursor-pointer rounded-md border border-base-content/15 bg-transparent p-0.5"
                    value={pickerValue}
                    disabled={disabled || readOnly}
                    onChange={(event) => onValueChange(normalizeHex(event.target.value))}
                />
                <input
                    id={id}
                    type="text"
                    inputMode="text"
                    autoComplete="off"
                    placeholder={fallbackColor}
                    maxLength={7}
                    className="min-w-0 flex-1 bg-transparent text-sm outline-none"
                    value={normalized}
                    disabled={disabled}
                    readOnly={readOnly}
                    aria-invalid={Boolean(error) || undefined}
                    onChange={(event) => onValueChange(normalizeHex(event.target.value))}
                />
                {allowClear && normalized ? (
                    <button
                        type="button"
                        className="shrink-0 text-xs font-medium text-base-content/45 transition hover:text-base-content/70"
                        disabled={disabled || readOnly}
                        onClick={() => onValueChange("")}
                    >
                        Padrão
                    </button>
                ) : null}
            </div>
            {!normalized ? (
                <p className="mt-1 text-[11px] text-base-content/40">
                    Sem cor definida usa a secundária do layout ({fallbackColor}).
                </p>
            ) : null}
        </InputFieldChrome>
    );
}
