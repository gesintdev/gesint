"use client";

import clsx from "clsx";
import { ChevronDown, Loader2, X } from "lucide-react";
import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react";

import type { InputFieldChromeProps } from "@/shared/components/ui/input/input-field.types";
import { fieldClass, InputFieldChrome } from "@/shared/components/ui/input/InputFieldChrome";
import { InputSelectPanel } from "@/shared/components/ui/input/InputSelectPanel";
import type { SelectItem, SelectSearchFn } from "@/shared/components/ui/input/select-item.types";
import { useClickOutside, useListboxKeyboard } from "@/shared/components/ui/input/use-listbox-keyboard";

const MAX_VISIBLE = 6;
const REMOTE_MIN_CHARS = 2;
const DEBOUNCE_MS = 300;

function filterItems(items: SelectItem[], query: string): SelectItem[] {
    const q = query.trim().toLowerCase();
    if (!q) return items.slice(0, MAX_VISIBLE);
    return items
        .filter(
            (item) =>
                item.label.toLowerCase().includes(q) ||
                item.description?.toLowerCase().includes(q) ||
                item.value.toLowerCase().includes(q),
        )
        .slice(0, MAX_VISIBLE);
}

function mergeVisibleItems(staticFiltered: SelectItem[], remote: SelectItem[]): SelectItem[] {
    const merged = [...staticFiltered];
    for (const item of remote) {
        if (!merged.some((m) => m.value === item.value)) merged.push(item);
    }
    return merged.slice(0, MAX_VISIBLE * 2);
}

export type InputSelectAutocompleteProps = InputFieldChromeProps & {
    items?: SelectItem[];
    onSearch?: SelectSearchFn;
    value?: string;
    onValueChange: (value: string, item?: SelectItem) => void;
    placeholder?: string;
    clearable?: boolean;
    remoteMinChars?: number;
    className?: string;
};

export function InputSelectAutocomplete({
    items: staticItems = [],
    onSearch,
    value,
    onValueChange,
    placeholder = "Selecione ou busque...",
    clearable = true,
    remoteMinChars = REMOTE_MIN_CHARS,
    label,
    hint,
    error,
    required,
    disabled,
    id: idProp,
    wrapperClassName,
    className,
}: InputSelectAutocompleteProps) {
    const autoId = useId();
    const id = idProp ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : autoId);
    const listId = `${id}-listbox`;
    const rootRef = useRef<HTMLDivElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [remoteItems, setRemoteItems] = useState<SelectItem[]>([]);
    const [pickedItem, setPickedItem] = useState<SelectItem | undefined>();
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(false);
    const filteredStatic = useMemo(() => filterItems(staticItems, query), [staticItems, query]);
    const visibleItems = useMemo(() => {
        const q = query.trim();
        if (!onSearch || q.length < remoteMinChars) return filteredStatic;
        return mergeVisibleItems(filteredStatic, remoteItems);
    }, [filteredStatic, onSearch, query, remoteItems, remoteMinChars]);
    const selected = useMemo(
        () =>
            staticItems.find((i) => i.value === value) ??
            remoteItems.find((i) => i.value === value) ??
            (pickedItem?.value === value ? pickedItem : undefined),
        [pickedItem, remoteItems, staticItems, value],
    );
    const close = useCallback(() => {
        setOpen(false);
        setQuery("");
    }, []);

    useClickOutside(rootRef, close, open);

    const runRemoteSearch = useCallback(
        async (q: string, nextPage: number, append: boolean) => {
            if (!onSearch) return;
            setLoading(true);
            try {
                const result = await onSearch(q, nextPage);
                setRemoteItems((prev) => (append ? [...prev, ...result.items] : result.items));
                setHasMore(result.hasMore);
                setPage(result.page);
            } finally {
                setLoading(false);
            }
        },
        [onSearch],
    );
    const scheduleRemote = useCallback(
        (q: string) => {
            if (!onSearch) return;
            const trimmed = q.trim();
            if (trimmed.length < remoteMinChars) {
                setRemoteItems([]);
                setHasMore(false);
                return;
            }

            if (debounceRef.current) clearTimeout(debounceRef.current);
            debounceRef.current = setTimeout(() => {
                void runRemoteSearch(trimmed, 0, false);
            }, DEBOUNCE_MS);
        },
        [onSearch, remoteMinChars, runRemoteSearch],
    );

    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    const pick = useCallback(
        (item: SelectItem) => {
            setPickedItem(item);
            onValueChange(item.value, item);
            close();
        },
        [close, onValueChange],
    );
    const { activeIndex, setActiveIndex, onKeyDown } = useListboxKeyboard(visibleItems, open, pick, close);
    const openPanel = () => {
        if (disabled) return;
        setOpen(true);
    };
    const handleInputChange = (next: string) => {
        setQuery(next);
        setOpen(true);
        scheduleRemote(next);
    };
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown" && !open) openPanel();
        onKeyDown(e);
    };
    const displayValue = open ? query : (selected?.label ?? "");
    const showRemoteFooter = Boolean(onSearch && query.trim().length >= remoteMinChars && hasMore);
    const footer = showRemoteFooter ? (
        <div className="border-t border-base-300/60 px-3 py-2">
            <button
                type="button"
                className="w-full text-center text-xs font-medium text-primary hover:underline"
                disabled={loading}
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => void runRemoteSearch(query.trim(), page + 1, true)}
            >
                {loading ? "Carregando..." : "Carregar mais resultados remotos"}
            </button>
        </div>
    ) : null;

    return (
        <InputFieldChrome
            label={label}
            hint={hint ?? "Filtra a lista local; com 2+ caracteres inclui busca remota"}
            error={error}
            required={required}
            disabled={disabled}
            id={id}
            wrapperClassName={wrapperClassName}
        >
            <div ref={rootRef} className="relative">
                <div
                    className={clsx(
                        "gommo-field",
                        fieldClass(disabled, false, Boolean(error)),
                        !value && !open && "gommo-select-trigger--placeholder",
                        className,
                    )}
                >
                    <input
                        id={id}
                        type="text"
                        role="combobox"
                        aria-expanded={open}
                        aria-controls={listId}
                        aria-autocomplete="list"
                        disabled={disabled}
                        placeholder={placeholder}
                        value={displayValue}
                        onChange={(e) => handleInputChange(e.target.value)}
                        onFocus={openPanel}
                        onKeyDown={handleKeyDown}
                    />
                    {loading && <Loader2 className="size-4 shrink-0 animate-spin text-base-content/35" />}
                    {clearable && value && !disabled && !loading && (
                        <button
                            type="button"
                            className="text-base-content/40 hover:text-base-content"
                            aria-label="Limpar"
                            onClick={() => {
                                setPickedItem(undefined);
                                onValueChange("");
                                setQuery("");
                                setRemoteItems([]);
                            }}
                        >
                            <X className="size-3.5" />
                        </button>
                    )}
                    <button
                        type="button"
                        tabIndex={-1}
                        className="text-base-content/40"
                        aria-label="Abrir lista"
                        disabled={disabled}
                        onClick={() => setOpen((v) => !v)}
                    >
                        <ChevronDown className={clsx("size-4 transition-transform", open && "rotate-180")} />
                    </button>
                </div>
                {open && (
                    <InputSelectPanel
                        listId={listId}
                        items={visibleItems}
                        activeIndex={activeIndex}
                        selectedValue={value}
                        onPick={pick}
                        onHighlight={setActiveIndex}
                        emptyMessage={loading ? "Buscando..." : "Nenhum item"}
                        footer={footer}
                    />
                )}
            </div>
        </InputFieldChrome>
    );
}
