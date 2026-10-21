"use client";

import clsx from "clsx";
import { useCallback, useEffect, useId, useRef, useState } from "react";

import { ColorPickerPanel } from "@/shared/components/ui/input/ColorPickerPanel";
import {
    fieldClass,
    InputFieldChrome,
} from "@/shared/components/ui/input/InputFieldChrome";
import type { InputFieldChromeProps } from "@/shared/components/ui/input/input-field.types";
import { useClickOutside } from "@/shared/components/ui/input/use-listbox-keyboard";

/** Cor secundária do layout (`--color-secondary` / `--gesint-primary-dark`). */
export const GESINT_SECONDARY_COLOR = "#0062cc";

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
    fallbackColor = GESINT_SECONDARY_COLOR,
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
    const preview = /^#[0-9A-Fa-f]{6}$/i.test(normalized) ? normalized : fallbackColor;
    const pickerHex = /^#[0-9A-Fa-f]{6}$/i.test(preview) ? preview.toUpperCase() : GESINT_SECONDARY_COLOR.toUpperCase();

    const [open, setOpen] = useState(false);
    const rootRef = useRef<HTMLDivElement>(null);
    const swatchRef = useRef<HTMLButtonElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const onValueChangeRef = useRef(onValueChange);
    onValueChangeRef.current = onValueChange;

    const close = useCallback(() => setOpen(false), []);
    useClickOutside([rootRef, panelRef], close, open);

    useEffect(() => {
        if (!open) return;
        const onKey = (event: KeyboardEvent) => {
            if (event.key === "Escape") setOpen(false);
        };
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [open]);

    const canOpen = !disabled && !readOnly;

    const handlePickerChange = useCallback((hex: string) => {
        onValueChangeRef.current(normalizeHex(hex));
    }, []);

    return (
        <InputFieldChrome {...chrome} id={id} error={error} disabled={disabled} readOnly={readOnly}>
            <div ref={rootRef} className="relative">
                <div
                    className={clsx(
                        "gesint-field flex items-center gap-2",
                        fieldClass(disabled, readOnly, Boolean(error)),
                        className,
                    )}
                >
                    <button
                        ref={swatchRef}
                        type="button"
                        aria-label={chrome.label ? `${chrome.label} (seletor)` : "Seletor de cor"}
                        aria-expanded={open}
                        aria-haspopup="dialog"
                        disabled={!canOpen}
                        className="size-8 shrink-0 cursor-pointer rounded-md border border-base-content/15 shadow-inner transition hover:brightness-95 disabled:cursor-not-allowed"
                        style={{ background: preview }}
                        onClick={() => {
                            if (!canOpen) return;
                            setOpen((prev) => !prev);
                        }}
                    />
                    <input
                        id={id}
                        type="text"
                        inputMode="text"
                        autoComplete="off"
                        placeholder={fallbackColor}
                        maxLength={7}
                        className="min-w-0 flex-1 bg-transparent font-mono text-sm outline-none"
                        value={normalized}
                        disabled={disabled}
                        readOnly={readOnly}
                        aria-invalid={Boolean(error) || undefined}
                        onChange={(event) => onValueChange(normalizeHex(event.target.value))}
                        onFocus={close}
                    />
                    {allowClear && normalized ? (
                        <button
                            type="button"
                            className="shrink-0 text-xs font-medium text-base-content/45 transition hover:text-base-content/70"
                            disabled={disabled || readOnly}
                            onClick={() => {
                                onValueChange("");
                                setOpen(false);
                            }}
                        >
                            Padrão
                        </button>
                    ) : null}
                </div>
                {open ? (
                    <ColorPickerPanel
                        ref={panelRef}
                        value={pickerHex}
                        anchorRef={swatchRef}
                        onChange={handlePickerChange}
                    />
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
