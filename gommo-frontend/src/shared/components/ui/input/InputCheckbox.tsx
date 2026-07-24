"use client";

import clsx from "clsx";
import {type ReactNode, useEffect, useRef} from "react";

export type CheckboxState = "unchecked" | "indeterminate" | "checked";

export type InputCheckboxProps = {
    /** API de 3 estados (preferida para select-all / parcial). */
    state?: CheckboxState;
    /** API binária. Ignorada quando `state` é informado. */
    checked?: boolean;
    /** Clique sem valor: o pai decide o próximo estado (ex.: parcial → cheio). */
    onChange?: () => void;
    /** Clique binário: recebe o próximo valor checked. */
    onCheckedChange?: (checked: boolean) => void;
    label?: ReactNode;
    labelClassName?: string;
    disabled?: boolean;
    readOnly?: boolean;
    className?: string;
    size?: "xs" | "sm" | "md";
    "aria-label"?: string;
};

const SIZE_CLASS = {
    xs: "checkbox-xs",
    sm: "checkbox-sm",
    md: "checkbox-md",
} as const;

/**
 * Checkbox DaisyUI com 3 estados:
 * - unchecked: vazio
 * - indeterminate: parcialmente selecionado (traço nativo)
 * - checked: totalmente selecionado (check nativo)
 */
export function InputCheckbox({
    state,
    checked = false,
    onChange,
    onCheckedChange,
    label,
    labelClassName,
    disabled = false,
    readOnly = false,
    className,
    size = "md",
    "aria-label": ariaLabel,
}: InputCheckboxProps) {
    const inputRef = useRef<HTMLInputElement>(null);
    const resolvedState: CheckboxState = state ?? (checked ? "checked" : "unchecked");
    const interactive = !disabled && !readOnly;
    const hasLabel = label != null && label !== "";
    const labelText = typeof label === "string" ? label : undefined;

    useEffect(() => {
        if (inputRef.current) {
            inputRef.current.indeterminate = resolvedState === "indeterminate";
        }
    }, [resolvedState]);

    const toggle = () => {
        if (!interactive) return;
        if (onChange) {
            onChange();
            return;
        }
        onCheckedChange?.(resolvedState !== "checked");
    };

    return (
        <span
            className={clsx(
                "flex items-center gap-2 leading-none",
                interactive ? "cursor-pointer" : "cursor-default",
                disabled && "opacity-60",
                className,
            )}
            onMouseDown={(event) => {
                // Evita foco/scroll no wrapper; não bloqueia o input nativo.
                if ((event.target as HTMLElement).closest("input")) return;
                event.preventDefault();
            }}
            onClick={(event) => {
                if ((event.target as HTMLElement).closest("input")) return;
                toggle();
            }}
        >
            <input
                ref={inputRef}
                type="checkbox"
                className={clsx("checkbox checkbox-primary shrink-0", SIZE_CLASS[size])}
                checked={resolvedState === "checked"}
                disabled={disabled}
                readOnly={readOnly}
                tabIndex={readOnly ? -1 : undefined}
                aria-label={ariaLabel ?? labelText}
                aria-checked={resolvedState === "indeterminate" ? "mixed" : resolvedState === "checked"}
                onChange={(event) => {
                    if (!interactive) return;
                    if (onChange) {
                        onChange();
                        return;
                    }
                    onCheckedChange?.(event.target.checked);
                }}
            />
            {hasLabel ? (
                <span className={clsx("text-sm font-normal leading-none text-base-content", labelClassName)}>
                    {label}
                </span>
            ) : null}
        </span>
    );
}

export function resolveCheckboxState(selectedCount: number, totalCount: number): CheckboxState {
    if (totalCount <= 0 || selectedCount <= 0) return "unchecked";
    if (selectedCount >= totalCount) return "checked";
    return "indeterminate";
}
