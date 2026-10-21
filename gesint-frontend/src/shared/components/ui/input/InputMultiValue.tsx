"use client";

import clsx from "clsx";
import { X } from "lucide-react";
import { type ClipboardEvent, type KeyboardEvent, useId, useRef, useState } from "react";

import type { InputFieldChromeProps } from "@/shared/components/ui/input/input-field.types";
import { fieldClass, InputFieldChrome } from "@/shared/components/ui/input/InputFieldChrome";

export type InputMultiValueProps = InputFieldChromeProps & {
    /** Valores serializados (ex.: separados por `;`). */
    value: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    /** Separador usado ao serializar. Padrão: `; `. */
    separator?: string;
    className?: string;
};

function parseValues(raw: string | undefined | null): string[] {
    if (!raw) return [];
    return raw
        .split(/\r?\n|;/)
        .map((item) => item.trim())
        .filter(Boolean);
}

function serializeValues(items: string[], separator: string): string {
    return items.join(separator);
}

function normalizeToken(value: string): string {
    return value.trim().replace(/\s+/g, " ");
}

export function InputMultiValue({
    label,
    hint,
    error,
    required,
    disabled,
    readOnly,
    wrapperClassName,
    sensitive,
    sensitivePermission,
    id: idProp,
    value,
    onValueChange,
    placeholder,
    separator = "; ",
    className,
}: InputMultiValueProps) {
    const autoId = useId();
    const id = idProp ?? (label ? `multi-${label.toLowerCase().replace(/\s+/g, "-")}` : autoId);
    const inputRef = useRef<HTMLInputElement>(null);
    const [draft, setDraft] = useState("");
    const items = parseValues(value);
    const editable = !disabled && !readOnly;

    const commitTokens = (tokens: string[]) => {
        const next = [...items];
        const seen = new Set(next.map((item) => item.toLocaleLowerCase("pt-BR")));
        for (const token of tokens) {
            const normalized = normalizeToken(token);
            if (!normalized) continue;
            const key = normalized.toLocaleLowerCase("pt-BR");
            if (seen.has(key)) continue;
            seen.add(key);
            next.push(normalized);
        }
        if (next.length === items.length) return;
        onValueChange(serializeValues(next, separator));
    };

    const commitDraft = () => {
        const token = normalizeToken(draft);
        if (!token) return;
        setDraft("");
        commitTokens([token]);
    };

    const removeAt = (index: number) => {
        if (!editable) return;
        const next = items.filter((_, i) => i !== index);
        onValueChange(serializeValues(next, separator));
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (!editable) return;

        if (event.key === "Tab" || event.key === "Enter" || event.key === ";") {
            if (!normalizeToken(draft)) return;
            event.preventDefault();
            commitDraft();
            return;
        }

        if (event.key === "Backspace" && !draft && items.length > 0) {
            event.preventDefault();
            removeAt(items.length - 1);
        }
    };

    const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
        if (!editable) return;
        const text = event.clipboardData.getData("text");
        if (!text || !/[\n;]/.test(text)) return;
        event.preventDefault();
        const tokens = parseValues(`${draft}${text}`);
        setDraft("");
        commitTokens(tokens);
    };

    const handleContainerClick = () => {
        if (!editable) return;
        inputRef.current?.focus();
    };

    return (
        <InputFieldChrome
            label={label}
            hint={hint}
            error={error}
            required={required}
            disabled={disabled}
            id={id}
            labelFor={false}
            wrapperClassName={wrapperClassName}
            sensitive={sensitive}
            sensitivePermission={sensitivePermission}
        >
            <div
                role="group"
                aria-labelledby={label ? `${id}-label` : undefined}
                onClick={handleContainerClick}
                className={clsx(
                    "gesint-field gesint-field--multi",
                    fieldClass(disabled, readOnly, Boolean(error)),
                    className,
                )}
            >
                {items.map((item, index) => (
                    <span
                        key={`${item}-${index}`}
                        className="inline-flex h-[1.375rem] max-w-full items-center gap-1 rounded-md border border-base-content/10 bg-base-content/5 px-2 text-[length:var(--gesint-control-font-size)] leading-none text-base-content/85"
                    >
                        <span className="truncate">{item}</span>
                        {editable ? (
                            <button
                                type="button"
                                className="inline-flex size-3.5 shrink-0 items-center justify-center rounded text-base-content/40 transition-colors hover:bg-base-content/10 hover:text-error"
                                aria-label={`Remover ${item}`}
                                onClick={(event) => {
                                    event.stopPropagation();
                                    removeAt(index);
                                }}
                            >
                                <X className="size-3" strokeWidth={2} />
                            </button>
                        ) : null}
                    </span>
                ))}
                <input
                    ref={inputRef}
                    id={id}
                    type="text"
                    value={draft}
                    disabled={disabled}
                    readOnly={readOnly}
                    placeholder={items.length === 0 ? placeholder : undefined}
                    aria-invalid={Boolean(error)}
                    aria-required={required}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    onBlur={commitDraft}
                />
            </div>
            {hint ? <p className="mt-1.5 text-[11px] text-base-content/45">{hint}</p> : null}
        </InputFieldChrome>
    );
}
