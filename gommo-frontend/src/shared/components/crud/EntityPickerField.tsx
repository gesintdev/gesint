import clsx from "clsx";
import { PanelRightOpen } from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { EntitySearchModal } from "@/shared/components/picker/EntitySearchModal";
import { InputAutocomplete } from "@/shared/components/ui/input/index";
import type { SelectItem, SelectSearchFn } from "@/shared/components/ui/input/select-item.types";
import type { EntityPickerAdvancedSearch } from "@/shared/types/entity-picker.types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuid(value: string): boolean {
    return UUID_RE.test(value.trim());
}

type EntityPickerFieldProps<T extends object = object> = {
    label: string;
    hint?: string;
    value: string;
    onValueChange: (id: string, item?: SelectItem) => void;
    onSearch: SelectSearchFn;
    resolveLabel: (id: string) => Promise<string>;
    placeholder?: string;
    required?: boolean;
    error?: string;
    disabled?: boolean;
    wrapperClassName?: string;
    advancedSearch?: EntityPickerAdvancedSearch<T>;
    /** Filtros fixos repassados à busca detalhada */
    advancedFixedFilters?: Record<string, string>;
    /** Permite valor livre (texto) além de UUID de entidade. */
    allowCustomValue?: boolean;
};

export function EntityPickerField<T extends object = object>({
    label,
    hint,
    value,
    onValueChange,
    onSearch,
    resolveLabel,
    placeholder = "Digite para buscar…",
    required,
    error,
    disabled,
    wrapperClassName,
    advancedSearch,
    advancedFixedFilters,
    allowCustomValue = false,
}: EntityPickerFieldProps<T>) {
    const [selectedLabel, setSelectedLabel] = useState("");
    const [modalOpen, setModalOpen] = useState(false);

    useEffect(() => {
        const id = value?.trim();
        if (!id) {
            setSelectedLabel("");
            return;
        }
        if (allowCustomValue && !isUuid(id)) {
            setSelectedLabel(id);
            return;
        }
        let cancelled = false;
        void resolveLabel(id)
            .then((name) => {
                if (!cancelled) setSelectedLabel(name);
            })
            .catch(() => {
                if (!cancelled) setSelectedLabel(allowCustomValue ? id : "");
            });
        return () => {
            cancelled = true;
        };
    }, [value, resolveLabel, allowCustomValue]);

    const search = useCallback((query: string, page: number) => onSearch(query, page), [onSearch]);
    const handlePick = (item: SelectItem) => {
        onValueChange(item.value, item);
        setSelectedLabel(item.label);
    };
    const advancedButton = advancedSearch ? (
        <button
            type="button"
            disabled={disabled}
            aria-label="Busca detalhada"
            title="Busca detalhada"
            className={clsx(
                "flex shrink-0 items-center self-stretch border-s border-base-content/10",
                "-me-[length:var(--gommo-control-px)] px-2.5 text-base-content/40 transition-colors",
                "hover:bg-base-200/50 hover:text-primary",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30",
                disabled && "pointer-events-none opacity-50",
            )}
            onClick={() => setModalOpen(true)}
        >
            <PanelRightOpen className="size-4" />
        </button>
    ) : null;

    return (
        <>
            <InputAutocomplete
                label={label}
                hint={hint}
                value={value ?? ""}
                selectedLabel={selectedLabel}
                onValueChange={(v, item) => {
                    onValueChange(v, item);
                    setSelectedLabel(item?.label ?? v);
                }}
                onSearch={search}
                placeholder={placeholder}
                required={required}
                error={error}
                disabled={disabled}
                wrapperClassName={wrapperClassName}
                trailingAction={advancedButton}
                allowCustomValue={allowCustomValue}
            />
            {advancedSearch ? (
                <EntitySearchModal
                    open={modalOpen}
                    config={advancedSearch}
                    fixedFilters={advancedFixedFilters}
                    onClose={() => setModalOpen(false)}
                    onSelect={handlePick}
                />
            ) : null}
        </>
    );
}
