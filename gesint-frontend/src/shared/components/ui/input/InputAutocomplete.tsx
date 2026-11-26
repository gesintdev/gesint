import clsx from "clsx";
import { Loader2, Search } from "lucide-react";
import { type ReactNode, useCallback, useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { canClearOptionalField, FieldClearButton } from "@/shared/components/ui/input/FieldClearButton";
import type { InputFieldChromeProps } from "@/shared/components/ui/input/input-field.types";
import { fieldClass, InputFieldChrome } from "@/shared/components/ui/input/InputFieldChrome";
import { InputSelectPanel } from "@/shared/components/ui/input/InputSelectPanel";
import { useAnchoredPanelPosition } from "@/shared/components/ui/input/popover-placement";
import { usePopoverPortalRoot } from "@/shared/components/ui/input/popover-portal";
import type { SelectItem, SelectSearchFn } from "@/shared/components/ui/input/select-item.types";
import { useClickOutside, useListboxKeyboard } from "@/shared/components/ui/input/use-listbox-keyboard";

const PAGE_SIZE = 6;
const DEBOUNCE_MS = 300;

export type InputAutocompleteProps = InputFieldChromeProps & {
    value?: string;
    /** Rótulo exibido quando `value` já está definido (ex.: edição). */
    selectedLabel?: string;
    onValueChange: (value: string, item?: SelectItem) => void;
    onSearch: SelectSearchFn;
    placeholder?: string;
    minChars?: number;
    clearable?: boolean;
    className?: string;
    /** Desliga sugestões do navegador (busca via API). */
    autoComplete?: string;
    /** Ação integrada à direita do campo (ex.: botão de busca detalhada) */
    trailingAction?: ReactNode;
    /** Permite confirmar o texto digitado (Enter/blur) como valor livre, sem item da lista. */
    allowCustomValue?: boolean;
};

export function InputAutocomplete({
    value,
    selectedLabel: selectedLabelProp,
    onValueChange,
    onSearch,
    placeholder = "Buscar...",
    minChars = 0,
    label,
    hint,
    error,
    required,
    disabled,
    labelFor,
    id: idProp,
    wrapperClassName,
    sensitive,
    sensitivePermission,
    className,
    autoComplete = "off",
    trailingAction,
    allowCustomValue = false,
}: InputAutocompleteProps) {
    const autoId = useId();
    const id = idProp ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : autoId);
    const listId = `${id}-listbox`;
    const rootRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const portalRoot = usePopoverPortalRoot();
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const queryRef = useRef("");
    const openRef = useRef(false);
    const requestRef = useRef(0);
    const [open, setOpen] = useState(false);
    const panelBox = useAnchoredPanelPosition(open, rootRef, panelRef, { gap: 4, fallbackHeight: 240 });
    const [query, setQuery] = useState("");
    const [items, setItems] = useState<SelectItem[]>([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(false);
    const [loading, setLoading] = useState(false);
    /** Consulta cuja resposta já chegou. Enquanto for diferente de `query`, a lista ainda não foi buscada. */
    const [settledQuery, setSettledQuery] = useState<string | null>(null);
    const [selectedLabel, setSelectedLabel] = useState("");
    const displayText = open ? query : selectedLabel;
    const close = useCallback(() => {
        openRef.current = false;
        setOpen(false);
        setQuery("");
        queryRef.current = "";
    }, []);
    const commitCustomValue = useCallback(
        (raw: string) => {
            const next = raw.trim();
            if (!next) return false;
            onValueChange(next);
            setSelectedLabel(next);
            close();
            return true;
        },
        [close, onValueChange],
    );
    const handleOutside = useCallback(() => {
        if (allowCustomValue && queryRef.current.trim()) {
            commitCustomValue(queryRef.current);
            return;
        }
        close();
    }, [allowCustomValue, close, commitCustomValue]);

    useClickOutside([rootRef, panelRef], handleOutside, open);

    const runSearch = useCallback(
        async (q: string, nextPage: number, append: boolean, requestId: number) => {
            if (q.length < minChars) {
                if (requestId !== requestRef.current) return;
                setItems([]);
                setHasMore(false);
                setLoading(false);
                setSettledQuery(null);
                return;
            }
            setLoading(true);
            try {
                const result = await onSearch(q, nextPage);
                if (requestId !== requestRef.current) return;
                setItems((prev) => (append ? [...prev, ...result.items] : result.items));
                setHasMore(result.hasMore);
                setPage(result.page);
            } catch {
                if (requestId !== requestRef.current) return;
                if (!append) setItems([]);
                setHasMore(false);
            } finally {
                if (requestId === requestRef.current) {
                    setLoading(false);
                    setSettledQuery(q);
                }
            }
        },
        [minChars, onSearch],
    );
    const scheduleSearch = useCallback(
        (q: string) => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
            const requestId = ++requestRef.current;
            if (q.length < minChars) {
                setItems([]);
                setHasMore(false);
                setLoading(false);
                setSettledQuery(null);
                return;
            }
            setItems([]);
            setHasMore(false);
            setSettledQuery(null);
            setLoading(true);
            debounceRef.current = setTimeout(() => {
                void runSearch(q, 0, false, requestId);
            }, DEBOUNCE_MS);
        },
        [minChars, runSearch],
    );

    useEffect(() => {
        return () => {
            if (debounceRef.current) clearTimeout(debounceRef.current);
        };
    }, []);

    useEffect(() => {
        if (!value) {
            setSelectedLabel("");
            return;
        }

        if (!open && selectedLabelProp !== undefined) {
            setSelectedLabel(selectedLabelProp);
        }
    }, [value, selectedLabelProp, open]);

    const pick = useCallback(
        (item: SelectItem) => {
            onValueChange(item.value, item);
            setSelectedLabel(item.label);
            close();
        },
        [close, onValueChange],
    );
    const { activeIndex, setActiveIndex, onKeyDown } = useListboxKeyboard(items, open, pick, close);
    const handleFocus = () => {
        if (disabled) return;
        openRef.current = true;
        setOpen(true);
        scheduleSearch(query);
    };
    const handleChange = (next: string) => {
        queryRef.current = next;
        setQuery(next);
        openRef.current = true;
        setOpen(true);
        scheduleSearch(next);
    };
    const handleBlur = () => {
        if (!allowCustomValue) return;
        // defer to allow click on list item to win over blur
        window.setTimeout(() => {
            if (!openRef.current) return;
            if (queryRef.current.trim()) {
                commitCustomValue(queryRef.current);
            }
        }, 120);
    };
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "ArrowDown" && !open) {
            openRef.current = true;
            setOpen(true);
            scheduleSearch(query);
        }
        if (allowCustomValue && e.key === "Enter" && open) {
            const active = items[activeIndex];
            if (!active || active.disabled) {
                e.preventDefault();
                if (commitCustomValue(query)) return;
            }
        }
        onKeyDown(e);
    };
    const footer = useMemo(() => {
        if (!hasMore) return null;
        return (
            <div className="border-t border-base-300/60 px-3 py-2">
                <button
                    type="button"
                    className="w-full text-center text-xs font-medium text-primary hover:underline"
                    disabled={loading}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                        const requestId = ++requestRef.current;
                        void runSearch(query, page + 1, true, requestId);
                    }}
                >
                    {loading ? "Carregando..." : "Carregar mais"}
                </button>
            </div>
        );
    }, [hasMore, loading, page, query, runSearch]);

    return (
        <InputFieldChrome
            label={label}
            hint={hint}
            error={error}
            required={required}
            disabled={disabled}
            labelFor={labelFor}
            id={id}
            wrapperClassName={wrapperClassName}
            sensitive={sensitive}
            sensitivePermission={sensitivePermission}
        >
            <div ref={rootRef} className="relative">
                <div className={clsx("gesint-field", fieldClass(disabled, false, Boolean(error)), className)}>
                    <Search className="size-4 shrink-0 text-base-content/35" aria-hidden />
                    <input
                        id={id}
                        type="text"
                        role="combobox"
                        aria-expanded={open}
                        aria-controls={listId}
                        aria-autocomplete="list"
                        autoComplete={autoComplete}
                        autoCorrect="off"
                        autoCapitalize="off"
                        spellCheck={false}
                        data-1p-ignore
                        data-lpignore="true"
                        data-form-type="other"
                        disabled={disabled}
                        placeholder={placeholder}
                        value={displayText}
                        onChange={(e) => handleChange(e.target.value)}
                        onFocus={handleFocus}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                    />
                    {canClearOptionalField({ required, disabled, loading, value }) ? (
                        <FieldClearButton
                            onClick={() => {
                                onValueChange("");
                                setSelectedLabel("");
                                setQuery("");
                                queryRef.current = "";
                                setItems([]);
                                setHasMore(false);
                                setLoading(false);
                                setSettledQuery(null);
                                requestRef.current += 1;
                            }}
                        />
                    ) : null}
                    {loading && <Loader2 className="size-4 shrink-0 animate-spin text-base-content/35" />}
                    {trailingAction}
                </div>
                {open && query.length >= minChars && portalRoot
                    ? createPortal(
                          <InputSelectPanel
                              ref={panelRef}
                              listId={listId}
                              items={items}
                              activeIndex={activeIndex}
                              selectedValue={value}
                              onPick={pick}
                              onHighlight={setActiveIndex}
                              emptyMessage={
                                  loading || settledQuery !== query ? "Buscando..." : "Nenhum resultado"
                              }
                              footer={footer}
                              className="fixed z-[200]"
                              style={{
                                  position: "fixed",
                                  top: panelBox.top,
                                  left: panelBox.left,
                                  width: panelBox.width,
                                  minWidth: panelBox.width,
                                  margin: 0,
                                  maxHeight: panelBox.maxHeight ?? undefined,
                                  overflowY: panelBox.maxHeight != null ? "auto" : undefined,
                              }}
                          />,
                          portalRoot,
                      )
                    : null}
            </div>
        </InputFieldChrome>
    );
}
