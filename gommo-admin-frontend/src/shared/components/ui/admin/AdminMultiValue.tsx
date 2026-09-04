"use client";

import { X } from "lucide-react";
import {
    type ClipboardEvent,
    type CSSProperties,
    type FocusEvent,
    type KeyboardEvent,
    forwardRef,
    useId,
    useImperativeHandle,
    useRef,
    useState,
} from "react";

export type AdminMultiValueHandle = {
    /** Confirma o rascunho atual e devolve o valor serializado. */
    flush: () => string;
};

type AdminMultiValueProps = {
    label: string;
    value: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
    /** Separador ao serializar. Padrao: `; `. */
    separator?: string;
    /** Mascara aplicada no rascunho e nos tokens commitados. */
    maskValue?: (value: string) => string;
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

function normalizeToken(value: string, maskValue?: (value: string) => string): string {
    const trimmed = value.trim().replace(/\s+/g, " ");
    if (!trimmed) return "";
    return maskValue ? maskValue(trimmed) : trimmed;
}

const controlStyle: CSSProperties = {
    minHeight: 36,
    padding: "5px 8px",
    border: "1px solid var(--ga-border-strong)",
    borderRadius: "var(--ga-radius-sm)",
    background: "var(--ga-surface)",
    color: "var(--ga-text)",
    outline: "none",
    width: "100%",
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: 6,
    cursor: "text",
};

function applyFocus(el: HTMLElement) {
    el.style.borderColor = "var(--ga-primary)";
    el.style.boxShadow = "0 0 0 2px rgba(0,123,255,0.12)";
}

function applyBlur(el: HTMLElement) {
    el.style.borderColor = "var(--ga-border-strong)";
    el.style.boxShadow = "none";
}

export const AdminMultiValue = forwardRef<AdminMultiValueHandle, AdminMultiValueProps>(
    function AdminMultiValue(
        {
            label,
            value,
            onChange,
            placeholder = "",
            required = false,
            disabled = false,
            separator = "; ",
            maskValue,
        },
        ref,
    ) {
        const autoId = useId();
        const id = `admin-multi-${autoId}`;
        const inputRef = useRef<HTMLInputElement>(null);
        const containerRef = useRef<HTMLDivElement>(null);
        const [draft, setDraft] = useState("");
        const items = parseValues(value);
        const editable = !disabled;

        const commitTokens = (tokens: string[], baseItems = items): string => {
            const next = [...baseItems];
            const seen = new Set(next.map((item) => item.toLocaleLowerCase("pt-BR")));
            for (const token of tokens) {
                const normalized = normalizeToken(token, maskValue);
                if (!normalized) continue;
                const key = normalized.toLocaleLowerCase("pt-BR");
                if (seen.has(key)) continue;
                seen.add(key);
                next.push(normalized);
            }
            const serialized = serializeValues(next, separator);
            if (serialized !== serializeValues(baseItems, separator)) {
                onChange?.(serialized);
            }
            return serialized;
        };

        const commitDraft = (): string => {
            const token = normalizeToken(draft, maskValue);
            if (!token) return value;
            setDraft("");
            return commitTokens([token]);
        };

        useImperativeHandle(ref, () => ({
            flush: () => commitDraft(),
        }));

        const removeAt = (index: number) => {
            if (!editable) return;
            const next = items.filter((_, i) => i !== index);
            onChange?.(serializeValues(next, separator));
        };

        const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
            if (!editable) return;

            if (event.key === "Tab" || event.key === "Enter" || event.key === ";") {
                if (!normalizeToken(draft, maskValue)) return;
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

        const handleContainerFocus = (event: FocusEvent<HTMLDivElement>) => {
            if (event.currentTarget === containerRef.current) {
                applyFocus(event.currentTarget);
            }
        };

        const handleContainerBlur = (event: FocusEvent<HTMLDivElement>) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
                applyBlur(event.currentTarget);
                commitDraft();
            }
        };

        return (
            <div className="flex flex-col gap-1">
                <label
                    htmlFor={id}
                    className="text-[11px] font-semibold uppercase tracking-[0.04em] text-[var(--ga-text-muted)]"
                >
                    {label}
                    {required ? <span className="ml-0.5 text-error">*</span> : null}
                </label>
                <div
                    ref={containerRef}
                    role="group"
                    tabIndex={-1}
                    onClick={() => {
                        if (editable) inputRef.current?.focus();
                    }}
                    onFocus={handleContainerFocus}
                    onBlur={handleContainerBlur}
                    style={{
                        ...controlStyle,
                        background: disabled ? "var(--ga-surface-2)" : "var(--ga-surface)",
                    }}
                >
                    {items.map((item, index) => (
                        <span
                            key={`${item}-${index}`}
                            className="inline-flex h-[1.375rem] max-w-full items-center gap-1 rounded-md border border-[var(--ga-border)] bg-[var(--ga-surface-2)] px-2 text-[12px] leading-none text-[var(--ga-text)]"
                        >
                            <span className="truncate">{item}</span>
                            {editable ? (
                                <button
                                    type="button"
                                    className="inline-flex size-3.5 shrink-0 items-center justify-center rounded text-[var(--ga-text-muted)] hover:text-error"
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
                        placeholder={items.length === 0 ? placeholder : undefined}
                        onChange={(event) => {
                            const next = event.target.value;
                            setDraft(maskValue ? maskValue(next) : next);
                        }}
                        onKeyDown={handleKeyDown}
                        onPaste={handlePaste}
                        style={{
                            flex: "1 1 120px",
                            minWidth: 120,
                            border: "none",
                            outline: "none",
                            background: "transparent",
                            color: "inherit",
                            padding: "2px 0",
                            fontSize: 13,
                        }}
                    />
                </div>
            </div>
        );
    },
);
