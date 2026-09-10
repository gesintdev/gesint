"use client";

import clsx from "clsx";
import { ChevronsLeft, ChevronsRight, ChevronLeft, ChevronRight } from "lucide-react";
import { memo, useMemo, useState, type ReactNode } from "react";

import { Button } from "@/shared/components/ui/Button";
import { InputString } from "@/shared/components/ui/input/index";

export type MultiSelectDuoListItem = {
    value: string;
    label: string;
};

type MultiSelectDuoListProps = {
    items: MultiSelectDuoListItem[];
    value: string[];
    onChange: (next: string[]) => void;
    availableTitle?: string;
    selectedTitle?: string;
    filterPlaceholder?: string;
    disabled?: boolean;
    className?: string;
    emptyAvailableMessage?: string;
    emptySelectedMessage?: string;
    /** Se true, a lista disponivel so renderiza apos digitar no filtro (listas grandes). */
    deferAvailableUntilFilter?: boolean;
};

function normalize(text: string): string {
    return text.trim().toLowerCase();
}

function filterItems(items: MultiSelectDuoListItem[], query: string): MultiSelectDuoListItem[] {
    const q = normalize(query);
    if (!q) return items;
    return items.filter((item) => normalize(`${item.value} ${item.label}`).includes(q));
}

export const MultiSelectDuoList = memo(function MultiSelectDuoList({
    items,
    value,
    onChange,
    availableTitle = "Lista de valores disponiveis",
    selectedTitle = "Lista de valores adicionados",
    filterPlaceholder = "Filtrar...",
    disabled = false,
    className,
    emptyAvailableMessage = "Nenhum item disponivel.",
    emptySelectedMessage = "Nenhum item adicionado.",
    deferAvailableUntilFilter = false,
}: MultiSelectDuoListProps) {
    const [availableFilter, setAvailableFilter] = useState("");
    const [selectedFilter, setSelectedFilter] = useState("");
    const [checkedAvailable, setCheckedAvailable] = useState<string[]>([]);
    const [checkedSelected, setCheckedSelected] = useState<string[]>([]);

    const selectedSet = useMemo(() => new Set(value), [value]);

    const availableItems = useMemo(
        () => items.filter((item) => !selectedSet.has(item.value)),
        [items, selectedSet],
    );
    const selectedItems = useMemo(() => {
        const byValue = new Map(items.map((item) => [item.value, item]));
        return value
            .map((code) => byValue.get(code) ?? { value: code, label: code })
            .filter(Boolean);
    }, [items, value]);

    const availableFilterActive = availableFilter.trim().length > 0;
    const visibleAvailable = useMemo(() => {
        if (deferAvailableUntilFilter && !availableFilterActive) return [];
        return filterItems(availableItems, availableFilter);
    }, [availableItems, availableFilter, availableFilterActive, deferAvailableUntilFilter]);
    const visibleSelected = useMemo(
        () => filterItems(selectedItems, selectedFilter),
        [selectedItems, selectedFilter],
    );

    const availableEmptyMessage =
        deferAvailableUntilFilter && !availableFilterActive
            ? "Digite no filtro para buscar na lista."
            : emptyAvailableMessage;

    const addValues = (codes: string[]) => {
        if (disabled || codes.length === 0) return;
        const next = [...value];
        for (const code of codes) {
            if (!next.includes(code)) next.push(code);
        }
        onChange(next);
        setCheckedAvailable((prev) => prev.filter((code) => !codes.includes(code)));
    };

    const removeValues = (codes: string[]) => {
        if (disabled || codes.length === 0) return;
        const remove = new Set(codes);
        onChange(value.filter((code) => !remove.has(code)));
        setCheckedSelected((prev) => prev.filter((code) => !codes.includes(code)));
    };

    const toggleChecked = (
        list: "available" | "selected",
        code: string,
        checked: boolean,
    ) => {
        const setter = list === "available" ? setCheckedAvailable : setCheckedSelected;
        setter((prev) => {
            if (checked) return prev.includes(code) ? prev : [...prev, code];
            return prev.filter((item) => item !== code);
        });
    };

    return (
        <div className={clsx("sm:col-span-12 grid items-stretch gap-3 lg:grid-cols-[1fr_auto_1fr]", className)}>
            <DuoColumn
                title={availableTitle}
                filter={availableFilter}
                onFilterChange={setAvailableFilter}
                filterPlaceholder={filterPlaceholder}
                items={visibleAvailable}
                checkedIds={checkedAvailable}
                onToggle={(code, checked) => toggleChecked("available", code, checked)}
                onActivate={(code) => addValues([code])}
                disabled={disabled}
                emptyMessage={availableEmptyMessage}
            />

            <div className="flex flex-row items-center justify-center gap-2 self-center lg:flex-col">
                <TransferButton
                    label="Adicionar selecionados"
                    icon={<ChevronRight className="size-4" />}
                    disabled={disabled || checkedAvailable.length === 0}
                    onClick={() => addValues(checkedAvailable)}
                />
                <TransferButton
                    label="Adicionar todos disponiveis"
                    icon={<ChevronsRight className="size-4" />}
                    disabled={
                        disabled ||
                        availableItems.length === 0 ||
                        (deferAvailableUntilFilter && !availableFilterActive)
                    }
                    onClick={() =>
                        addValues(
                            (deferAvailableUntilFilter && availableFilterActive
                                ? visibleAvailable
                                : availableItems
                            ).map((item) => item.value),
                        )
                    }
                />
                <TransferButton
                    label="Remover selecionados"
                    icon={<ChevronLeft className="size-4" />}
                    disabled={disabled || checkedSelected.length === 0}
                    onClick={() => removeValues(checkedSelected)}
                />
                <TransferButton
                    label="Remover todos adicionados"
                    icon={<ChevronsLeft className="size-4" />}
                    disabled={disabled || selectedItems.length === 0}
                    onClick={() => removeValues(selectedItems.map((item) => item.value))}
                />
            </div>

            <DuoColumn
                title={selectedTitle}
                filter={selectedFilter}
                onFilterChange={setSelectedFilter}
                filterPlaceholder={filterPlaceholder}
                items={visibleSelected}
                checkedIds={checkedSelected}
                onToggle={(code, checked) => toggleChecked("selected", code, checked)}
                onActivate={(code) => removeValues([code])}
                disabled={disabled}
                emptyMessage={emptySelectedMessage}
            />
        </div>
    );
});

function TransferButton({
    label,
    icon,
    disabled,
    onClick,
}: {
    label: string;
    icon: ReactNode;
    disabled?: boolean;
    onClick: () => void;
}) {
    return (
        <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-w-10"
            aria-label={label}
            title={label}
            disabled={disabled}
            onClick={onClick}
        >
            {icon}
        </Button>
    );
}

function DuoColumn({
    title,
    filter,
    onFilterChange,
    filterPlaceholder,
    items,
    checkedIds,
    onToggle,
    onActivate,
    disabled,
    emptyMessage,
}: {
    title: string;
    filter: string;
    onFilterChange: (value: string) => void;
    filterPlaceholder: string;
    items: MultiSelectDuoListItem[];
    checkedIds: string[];
    onToggle: (value: string, checked: boolean) => void;
    onActivate: (value: string) => void;
    disabled?: boolean;
    emptyMessage: string;
}) {
    const checkedSet = useMemo(() => new Set(checkedIds), [checkedIds]);

    return (
        <div className="flex h-80 max-h-80 flex-col gap-2 rounded-box border border-base-300 bg-base-100 p-3">
            <p className="shrink-0 text-xs font-bold text-base-content">{title}</p>
            <div className="shrink-0">
                <InputString
                    value={filter}
                    onValueChange={onFilterChange}
                    placeholder={filterPlaceholder}
                    disabled={disabled}
                />
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto rounded-md border border-base-300">
                {items.length === 0 ? (
                    <p className="p-3 text-sm text-base-content/55">{emptyMessage}</p>
                ) : (
                    <ul className="divide-y divide-base-300">
                        {items.map((item) => {
                            const checked = checkedSet.has(item.value);
                            return (
                                <li key={item.value}>
                                    <label
                                        className={clsx(
                                            "flex cursor-pointer items-start gap-2 px-2.5 py-2 text-sm",
                                            checked ? "bg-primary/8" : "hover:bg-base-200/60",
                                            disabled && "cursor-not-allowed opacity-60",
                                        )}
                                        onDoubleClick={(event) => {
                                            event.preventDefault();
                                            if (!disabled) onActivate(item.value);
                                        }}
                                    >
                                        <input
                                            type="checkbox"
                                            className="checkbox checkbox-sm checkbox-primary mt-0.5"
                                            checked={checked}
                                            disabled={disabled}
                                            onChange={(event) =>
                                                onToggle(item.value, event.target.checked)
                                            }
                                        />
                                        <span className="min-w-0 leading-snug">
                                            <span className="font-medium text-base-content/80">
                                                {item.value}
                                            </span>{" "}
                                            <span className="text-base-content/70">{item.label}</span>
                                        </span>
                                    </label>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}
