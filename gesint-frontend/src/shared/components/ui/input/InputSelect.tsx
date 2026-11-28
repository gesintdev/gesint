"use client";

import clsx from "clsx";
import { ChevronDown } from "lucide-react";
import { useCallback, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { canClearOptionalField, FieldClearButton } from "@/shared/components/ui/input/FieldClearButton";
import type { InputFieldChromeProps } from "@/shared/components/ui/input/input-field.types";
import { fieldClass, InputFieldChrome } from "@/shared/components/ui/input/InputFieldChrome";
import { InputSelectPanel } from "@/shared/components/ui/input/InputSelectPanel";
import { useAnchoredPanelPosition } from "@/shared/components/ui/input/popover-placement";
import { usePopoverPortalRoot } from "@/shared/components/ui/input/popover-portal";
import type { SelectItem } from "@/shared/components/ui/input/select-item.types";
import { useClickOutside, useListboxKeyboard } from "@/shared/components/ui/input/use-listbox-keyboard";

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
    label,
    hint,
    error,
    required,
    disabled,
    id: idProp,
    wrapperClassName,
    sensitive,
    sensitivePermission,
    className,
}: InputSelectProps) {
    const autoId = useId();
    const id = idProp ?? (label ? label.toLowerCase().replace(/\s+/g, "-") : autoId);
    const listId = `${id}-listbox`;
    const labelId = `${id}-label`;
    const rootRef = useRef<HTMLDivElement>(null);
    const panelRef = useRef<HTMLDivElement>(null);
    const portalRoot = usePopoverPortalRoot();
    const [open, setOpen] = useState(false);
    const panelBox = useAnchoredPanelPosition(open, rootRef, panelRef, { gap: 4, fallbackHeight: 240 });
    const selected = useMemo(() => items.find((i) => i.value === value), [items, value]);
    const close = useCallback(() => setOpen(false), []);

    useClickOutside([rootRef, panelRef], close, open);

    const pick = useCallback(
        (item: SelectItem) => {
            onValueChange(item.value);
            close();
        },
        [close, onValueChange],
    );
    const { activeIndex, setActiveIndex, onKeyDown } = useListboxKeyboard(items, open, pick, close);
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
            labelFor={false}
            wrapperClassName={wrapperClassName}
            sensitive={sensitive}
            sensitivePermission={sensitivePermission}
        >
            <div ref={rootRef} className="relative">
                <button
                    type="button"
                    id={id}
                    role="combobox"
                    disabled={disabled}
                    aria-labelledby={label ? labelId : undefined}
                    aria-haspopup="listbox"
                    aria-expanded={open}
                    aria-controls={listId}
                    aria-invalid={Boolean(error)}
                    aria-required={required}
                    className={clsx(
                        "gesint-field w-full cursor-pointer text-left",
                        fieldClass(disabled, false, Boolean(error)),
                        !selected && "gesint-select-trigger--placeholder",
                        className,
                    )}
                    onClick={() => !disabled && setOpen((v) => !v)}
                    onKeyDown={handleKeyDown}
                >
                    <span className="min-w-0 flex-1 truncate">{selected?.label ?? placeholder}</span>
                    <span className="flex shrink-0 items-center gap-1 text-base-content/40">
                        {canClearOptionalField({ required, disabled, value }) ? (
                            <FieldClearButton embedded onClick={() => onValueChange("")} />
                        ) : null}
                        <ChevronDown className={clsx("size-4 transition-transform", open && "rotate-180")} />
                    </span>
                </button>
                {open && portalRoot
                    ? createPortal(
                          <InputSelectPanel
                              ref={panelRef}
                              listId={listId}
                              items={items}
                              activeIndex={activeIndex}
                              selectedValue={value}
                              onPick={pick}
                              onHighlight={setActiveIndex}
                              className="fixed z-200"
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
