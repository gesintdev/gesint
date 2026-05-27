"use client";

import clsx from "clsx";
import {ChevronDown, X} from "lucide-react";
import {useCallback, useId, useMemo, useRef, useState} from "react";
import type {InputFieldChromeProps} from "@/shared/components/ui/input/input-field.types";
import {fieldClass, InputFieldChrome} from "@/shared/components/ui/input/InputFieldChrome";
import {InputSelectPanel} from "@/shared/components/ui/input/InputSelectPanel";
import type {SelectItem} from "@/shared/components/ui/input/select-item.types";
import {useClickOutside, useListboxKeyboard} from "@/shared/components/ui/input/use-listbox-keyboard";

export type InputSelectProps = InputFieldChromeProps & {
    items: SelectItem[];
    value?: string;
    onValueChange: (value: string) => void;
    placeholder?: string;
    clearable?: boolean;
    className?: string;
};

export function InputSelect({
                                items,
                                value,
                                onValueChange,
                                placeholder = "Selecione...",
                                clearable = false,
                                label,
                                hint,
                                error,
                                required,
                                disabled,
                                id: idProp,
                                wrapperClassName,
                                className,
                            }: InputSelectProps) {
    const autoId = useId();
    const id = idProp ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : autoId);
    const listId = `${id}-listbox`;
    const rootRef = useRef<HTMLDivElement>(null);
    const [open, setOpen] = useState(false);

    const selected = useMemo(() => items.find((i) => i.value === value), [items, value]);

    const close = useCallback(() => setOpen(false), []);
    useClickOutside(rootRef, close, open);

    const pick = useCallback(
        (item: SelectItem) => {
            onValueChange(item.value);
            close();
        },
        [close, onValueChange],
    );

    const {activeIndex, setActiveIndex, onKeyDown} = useListboxKeyboard(items, open, pick, close);

    const handleKeyDown = (e: React.KeyboardEvent) => {
        const signal = onKeyDown(e);
        if (signal === "open") setOpen(true);
    };

    return (
        <InputFieldChrome
            label={label}
            hint={hint}
            error={error}
            required={required}
            disabled={disabled}
            id={id}
            wrapperClassName={wrapperClassName}
        >
            <div ref={rootRef} className="relative">
                <button
                    type="button"
                    id={id}
                    disabled={disabled}
                    aria-haspopup="listbox"
                    aria-expanded={open}
                    aria-controls={listId}
                    aria-invalid={Boolean(error)}
                    aria-required={required}
                    className={clsx(
                        "gommo-field w-full cursor-pointer text-left",
                        fieldClass(disabled, false, Boolean(error)),
                        !selected && "gommo-select-trigger--placeholder",
                        className,
                    )}
                    onClick={() => !disabled && setOpen((v) => !v)}
                    onKeyDown={handleKeyDown}
                >
                    <span className="min-w-0 flex-1 truncate">{selected?.label ?? placeholder}</span>
                    <span className="flex shrink-0 items-center gap-1 text-base-content/40">
            {clearable && value && !disabled && (
                <X
                    className="size-3.5 hover:text-base-content"
                    onClick={(e) => {
                        e.stopPropagation();
                        onValueChange("");
                    }}
                />
            )}
                        <ChevronDown className={clsx("size-4 transition-transform", open && "rotate-180")}/>
          </span>
                </button>

                {open && (
                    <InputSelectPanel
                        listId={listId}
                        items={items}
                        activeIndex={activeIndex}
                        selectedValue={value}
                        onPick={pick}
                        onHighlight={setActiveIndex}
                    />
                )}
            </div>
        </InputFieldChrome>
    );
}
